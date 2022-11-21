/* eslint-disable no-console */
import express from 'express';
import ssi from 'ssi-api-client';

import { setAccessToken, fetch } from './utils/fetch';
import { INTERVAL, strategies } from './strategies';
import config from './config';
import apis from './biz/apis';

import Streaming from './streaming';
import {
  getAccountTable,
  getOrderTable,
  getStockPositionTable,
  getStrategyTable,
} from './utils/table';
import { TradingSession } from './types/Market';
import OrderFactory from './factory/OrderFactory';
import { getLiveOrder } from './biz/order';
import { OrderHistory, OrderMatchEvent, OrderUpdateEvent } from './types/Order';
import BalanceFactory from './factory/BalanceFactory';
import PositionFactory from './factory/PositionFactory';
import { dataFetch, setDataAccessToken } from './utils/dataFetch';
import { wait } from './utils/time';
import { getBuyingStocks } from './utils/stock';
import { Mavelli } from './mavelli';

const BOT: Record<string, Mavelli> = {};

strategies.forEach((i) => {
  BOT[i.symbol] = new Mavelli(i.symbol, i);
});

const resetOrders = async () => {
  const liveOrders = await getLiveOrder();
  OrderFactory.setOrders(liveOrders);
  OrderFactory.cancelAllOrders();
};

const displayPortfolio = async () => {
  console.log('R. STRATEGY');
  console.table(getStrategyTable(strategies));

  await wait(1000);
  await BalanceFactory.update();
  console.log('R: ACCOUNT');
  console.table(getAccountTable([BalanceFactory.balance]));

  await wait(1000);
  await PositionFactory.update();
  console.log('R: POSITIONS');
  const positionList = getStockPositionTable(PositionFactory.positions);
  const stoppedList = positionList
    .filter((i) => !i.buying)
    .map((i) => i.symbol);
  const buyingList = getBuyingStocks(
    strategies.filter((i) => i.allocation > 0).map((i) => i.symbol),
    stoppedList,
  );
  console.table(positionList);
  console.log(`R. BUYING (${buyingList.length}):`, buyingList.join(', '));

  await wait(1000);
  const liveOrders = await getLiveOrder();
  OrderFactory.setOrders(liveOrders);
  console.log(`R: LIVE ORDERS (${OrderFactory.getLiveOrders().length})`);
  console.table(getOrderTable(OrderFactory.getLiveOrders()));
};

const onSessionUpdate = (session: TradingSession) => {
  Object.values(BOT).forEach((b) => {
    b.setSession(session);
  });
};

const onLastPrice = (symbol: string, price: number) => {
  BOT[symbol].setLastPrice(price);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onOrderUpdate = async (e: any, data: OrderUpdateEvent) => {
  const order = data.data;
  const symbol = order.instrumentID;

  // ignore old events
  const modifiedTime = order.modifiedTime;
  if (parseInt(modifiedTime) + INTERVAL.h04 < Date.now()) {
    return;
  }

  OrderFactory.orderUpdate([order as OrderHistory]);
  console.log(`R: LIVE ORDERS (${OrderFactory.getLiveOrders().length})`);
  console.table(getOrderTable(OrderFactory.getLiveOrders()));

  BOT[symbol].onOrderUpdate(data);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onOrderMatch = async (e: any, data: OrderMatchEvent) => {
  const order = data.data;
  const symbol = order.instrumentID;

  // ignore old events
  const matchTime = data.data.matchTime;
  if (parseInt(matchTime) + INTERVAL.m01 < Date.now()) {
    return;
  }

  console.log('R: ORDER MATCH');

  await wait(5000);
  displayPortfolio();

  await wait(5000);
  BOT[symbol].onOrderMatch(data);
};

const app = express();
app.listen(config.port, 'localhost', () =>
  console.log(`Example app listening on port ${config.port}!`),
);

const ssiData = dataFetch({
  url: config.market.ApiUrl + 'AccessToken',
  method: 'post',
  data: {
    consumerID: config.market.ConsumerID,
    consumerSecret: config.market.ConsumerSecret,
  },
}).then(
  (resp) => {
    if (resp.data.status === 200) {
      const access_token = resp.data.data.accessToken;
      const token = 'Bearer ' + access_token;
      setDataAccessToken(access_token);

      const stream = new Streaming({
        url: config.market.HubUrl,
        token: token,
      });

      const symbolList = strategies.map((i) => i.symbol).join('-');

      stream.connected = () => {
        stream
          .getClient()
          .invoke('FcMarketDataV2Hub', 'SwitchChannels', 'MI:VN30');
        stream
          .getClient()
          .invoke('FcMarketDataV2Hub', 'SwitchChannels', `F:${symbolList}`);
        stream
          .getClient()
          .invoke('FcMarketDataV2Hub', 'SwitchChannels', `R:${symbolList}`);
        stream
          .getClient()
          .invoke('FcMarketDataV2Hub', 'SwitchChannels', `B:${symbolList}`);
        stream
          .getClient()
          .invoke(
            'FcMarketDataV2Hub',
            'SwitchChannels',
            `X-QUOTE:${symbolList}`,
          );
        stream
          .getClient()
          .invoke(
            'FcMarketDataV2Hub',
            'SwitchChannels',
            `X-TRADE:${symbolList}`,
          );
      };

      stream.subscribe('FcMarketDataV2Hub', 'Broadcast', (message: string) => {
        const resp = JSON.parse(message);
        const type = resp.DataType;
        const data = JSON.parse(resp.Content);

        if (type === 'F') {
          const session = data.TradingSession as TradingSession;
          onSessionUpdate(session);
        }

        if (type === 'X-TRADE') {
          const symbol = data.Symbol;
          const price = data.LastPrice;
          onLastPrice(symbol, price);
        }

        if (type === 'X-QUOTE') {
          const symbol = data.Symbol;
          const price = data.BidPrice1;
          onLastPrice(symbol, price);
        }
      });

      stream.subscribe(
        'FcMarketDataV2Hub',
        'Reconnected',
        (message: string) => {
          console.log('Reconnected' + message);
        },
      );

      stream.subscribe(
        'FcMarketDataV2Hub',
        'Disconnected',
        (message: string) => {
          console.log('Disconnected' + message);
        },
      );

      stream.subscribe('FcMarketDataV2Hub', 'Error', (message: string) => {
        console.log(message);
      });

      stream.start();

      console.log('SSI Market Data Started!');
    } else {
      console.log(resp.data.message);
    }

    return true;
  },
  (reason) => {
    console.log(reason);
  },
);

// SSI Trading
const ssiTrading = fetch({
  url: ssi.api.GET_ACCESS_TOKEN,
  method: 'post',
  data: {
    consumerID: config.trading.ConsumerID,
    consumerSecret: config.trading.ConsumerSecret,
    code: config.pinCode,
    twoFactorType: 0,
    isSave: false,
  },
})
  .then((resp) => {
    if (resp.data.status === 200) {
      const access_token = resp.data.data.accessToken;
      setAccessToken(access_token);

      apis(app, access_token);

      ssi.initStream({
        url: config.trading.stream_url,
        access_token,
        notify_id: 0,
      });

      ssi.bind(ssi.events.onOrderUpdate, onOrderUpdate);

      ssi.bind(ssi.events.onOrderMatch, onOrderMatch);

      // ssi.bind(ssi.events.onError, function (e: any, data: any) {
      //   console.log('onError', JSON.stringify(data));
      // });

      // ssi.bind(ssi.events.onOrderError, function (e: any, data: any) {
      //   console.log('onOrderError', JSON.stringify(data));
      // });

      // ssi.bind(ssi.events.onClientPortfolioEvent, function (e: any, data: any) {
      //   console.log('onClientPortfolioEvent', data);
      // });

      ssi.start();
    } else {
      console.log(resp.data.message);
    }

    return true;
  })
  .catch((reason) => {
    console.log(reason);
  });

Promise.all([ssiData, ssiTrading]).then(async () => {
  console.log('SSI-DCA-BOT Started!');

  await resetOrders();
  await displayPortfolio();
  await wait(10000);

  Object.values(BOT).forEach((b) => {
    b.setReady();
  });
});
