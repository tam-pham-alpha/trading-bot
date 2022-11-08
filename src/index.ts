import express from 'express';
import ssi from 'ssi-api-client';

import { setAccessToken, fetch } from './utils/fetch';
import config, { INTERVAL, strategies } from './config';
import apis from './biz/apis';

import { placeBatchOrder, placeTakeProfitOrder } from './biz/trade';
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
import { OrderMatchEvent } from './types/Order';
import BalanceFactory from './factory/BalanceFactory';
import PositionFactory from './factory/PositionFactory';
import { dataFetch, setDataAccessToken } from './utils/dataFetch';
import { wait } from './utils/time';
import { getBuyingStocks } from './utils/stock';

let session: TradingSession = 'C';
let SYS_READY = false;
const lastPrice: Record<string, number> = {};
const tradingInterval: Record<string, any> = {};

const displayPortfolio = async () => {
  console.log('R. STRATEGY');
  console.table(getStrategyTable(strategies));

  await BalanceFactory.update();
  console.log('R: ACCOUNT');
  console.table(getAccountTable([BalanceFactory.balance]));

  await PositionFactory.update();
  console.log('R: POSITIONS');
  const positionList = getStockPositionTable(PositionFactory.positions);
  const stoppedList = positionList
    .filter((i) => !i.buying)
    .map((i) => i.symbol);
  const buyingList = getBuyingStocks(
    strategies.map((i) => i.symbol),
    stoppedList,
  );
  console.table(positionList);
  console.log(`R. BUYING (${buyingList.length}):`, buyingList.join(', '));

  SYS_READY = true;
};

const displayLiveOrders = async () => {
  const liveOrders = await getLiveOrder();
  OrderFactory.setOrders(liveOrders);
  console.log(`R: LIVE ORDERS (${OrderFactory.getLiveOrders().length})`);
  console.table(getOrderTable(OrderFactory.getLiveOrders()));
};

const startNewTradingInterval = async (symbol: string) => {
  if (session === 'LO' && lastPrice[symbol]) {
    console.log('A: NEW TRADING SESSION', symbol, session, lastPrice[symbol]);

    console.log('A: CANCEL ALL ORDERS');
    await OrderFactory.cancelOrdersBySymbol(symbol);

    await wait(5000);
    console.log('A: PLACE ORDERS', lastPrice[symbol]);
    await placeBatchOrder(symbol, lastPrice[symbol]);

    await wait(5000);
    await displayLiveOrders();
  }

  const strategy = strategies.find((i) => i.symbol === symbol);
  if (tradingInterval[symbol]) {
    clearInterval(tradingInterval[symbol]);
  }
  tradingInterval[symbol] = setInterval(() => {
    startNewTradingInterval(symbol);
  }, strategy?.interval || INTERVAL.m30);
};

const onTrade = (symbol: string, price: number) => {
  if (session !== 'LO' || !SYS_READY) return;

  const tmp = lastPrice[symbol];
  lastPrice[symbol] = price;

  placeTakeProfitOrder(symbol, price);

  if (!tmp) {
    startNewTradingInterval(symbol);
  }
};

const onOrderUpdate = async (e: any, data: any) => {
  if (session !== 'LO') return;

  // ignore old events
  const matchTime = data.data.matchTime;
  if (parseInt(matchTime) + INTERVAL.h04 < Date.now()) {
    return;
  }

  OrderFactory.orderUpdate([data.data]);
  console.log(`R: LIVE ORDERS (${OrderFactory.getLiveOrders()})`);
  console.table(getOrderTable(OrderFactory.getLiveOrders()));
};

const onOrderMatch = async (e: any, data: OrderMatchEvent) => {
  if (session !== 'LO') return;

  // ignore old events
  const matchTime = data.data.matchTime;
  if (parseInt(matchTime) + INTERVAL.m10 < Date.now()) {
    return;
  }

  console.log('R: ORDER MATCH');
  const symbol = data.data.instrumentID;
  lastPrice[symbol] = data.data.matchPrice;

  await wait(5000);
  await displayPortfolio();

  await wait(5000);
  startNewTradingInterval(symbol);
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

      stream.subscribe('FcMarketDataV2Hub', 'Broadcast', (message: any) => {
        const resp = JSON.parse(message);
        const type = resp.DataType;
        const data = JSON.parse(resp.Content);

        if (type === 'F') {
          session = data.TradingSession as TradingSession;
          strategies.map((i) => {
            startNewTradingInterval(i.symbol);
          });
        }

        if (type === 'X-TRADE') {
          const symbol = data.Symbol;
          const price = data.LastPrice;
          onTrade(symbol, price);
        }

        if (type === 'X-QUOTE') {
          const symbol = data.Symbol;
          const price = data.BidPrice1;
          onTrade(symbol, price);
        }
      });

      stream.subscribe('FcMarketDataV2Hub', 'Reconnected', (message: any) => {
        console.log('Reconnected' + message);
      });

      stream.subscribe('FcMarketDataV2Hub', 'Disconnected', (message: any) => {
        console.log('Disconnected' + message);
      });

      stream.subscribe('FcMarketDataV2Hub', 'Error', (message: any) => {
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

      ssi.bind(ssi.events.onError, function (e: any, data: any) {
        console.log('onError', JSON.stringify(data));
      });

      ssi.bind(ssi.events.onOrderError, function (e: any, data: any) {
        // console.log('onOrderError', JSON.stringify(data));
      });

      ssi.bind(ssi.events.onClientPortfolioEvent, function (e: any, data: any) {
        console.log('onClientPortfolioEvent', data);
      });

      ssi.start();
    } else {
      console.log(resp.data.message);
    }

    return true;
  })
  .catch((reason) => {
    console.log(reason);
  });

Promise.all([ssiData, ssiTrading]).then(() => {
  console.log('SSI-DCA-BOT Started!');
  displayPortfolio();
});
