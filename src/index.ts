/* eslint-disable no-console */
import express from 'express';
import ssi from 'ssi-api-client';

import { setAccessToken, fetch } from './utils/fetch';
import config, { INTERVAL, strategies } from './config';
import apis from './biz/apis';

import { placeBuyOrder, placeTakeProfitOrder } from './biz/trade';
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

let session: TradingSession = 'C';
let SYS_READY = false;
const LAST_PRICE: Record<string, number> = {};
const TRADING_INTERVAL: Record<string, any> = {};
const TRADING_SESSION: Record<string, boolean> = {};

const displayLiveOrders = async () => {
  const liveOrders = await getLiveOrder();
  OrderFactory.setOrders(liveOrders);
  console.log(`R: LIVE ORDERS (${OrderFactory.getLiveOrders().length})`);
  console.table(getOrderTable(OrderFactory.getLiveOrders()));
};

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
    strategies.filter((i) => i.allocation > 0).map((i) => i.symbol),
    stoppedList,
  );
  console.table(positionList);
  console.log(`R. BUYING (${buyingList.length}):`, buyingList.join(', '));

  await displayLiveOrders();

  SYS_READY = true;
};

const startNewTradingSession = async (symbol: string) => {
  console.log('A: NEW TRADING SESSION', symbol, session, LAST_PRICE[symbol]);

  if (TRADING_SESSION[symbol]) {
    return;
  }

  let order;
  TRADING_SESSION[symbol] = true;

  if (session === 'LO' && LAST_PRICE[symbol]) {
    // cancel existing orders if any
    if (OrderFactory.getLiveOrdersBySymbol(symbol).length) {
      console.log('A: CANCEL ALL ORDERS', symbol);
      await OrderFactory.cancelOrdersBySymbol(symbol);
      await wait(5000);
      await BalanceFactory.update();
      await wait(5000);
    }

    console.log('A: PLACE ORDERS', LAST_PRICE[symbol]);
    order = await placeBuyOrder(symbol, LAST_PRICE[symbol]);
  }

  const strategy = strategies.find((i) => i.symbol === symbol);
  if (TRADING_INTERVAL[symbol]) {
    clearInterval(TRADING_INTERVAL[symbol]);
  }

  if (order) {
    TRADING_INTERVAL[symbol] = setInterval(() => {
      startNewTradingSession(symbol);
    }, strategy?.interval || INTERVAL.m30);
  } else {
    // waiting for the new trade to trigger this again
    LAST_PRICE[symbol] = 0;
  }

  TRADING_SESSION[symbol] = false;
};

const onLastPrice = (symbol: string, price: number) => {
  if (session !== 'LO' || !SYS_READY) return;

  const t = LAST_PRICE[symbol];
  LAST_PRICE[symbol] = price;
  placeTakeProfitOrder(symbol, price);

  if (!t && LAST_PRICE[symbol]) {
    startNewTradingSession(symbol);
  }
};

const onOrderUpdate = async (e: any, data: OrderUpdateEvent) => {
  if (session !== 'LO') return;
  const order = data.data;

  // ignore old events
  const modifiedTime = order.modifiedTime;
  if (parseInt(modifiedTime) + INTERVAL.h04 < Date.now()) {
    return;
  }

  OrderFactory.orderUpdate([order as OrderHistory]);
  console.log(`R: LIVE ORDERS (${OrderFactory.getLiveOrders().length})`);
  console.table(getOrderTable(OrderFactory.getLiveOrders()));

  // if order is cancel by user start a new session
  if (order.orderStatus === 'CL' && order.ipAddress) {
    startNewTradingSession(order.instrumentID);
  }
};

const onOrderMatch = async (e: any, data: OrderMatchEvent) => {
  if (session !== 'LO') return;

  // ignore old events
  const matchTime = data.data.matchTime;
  if (parseInt(matchTime) + INTERVAL.m01 < Date.now()) {
    return;
  }

  console.log('R: ORDER MATCH');
  const symbol = data.data.instrumentID;
  LAST_PRICE[symbol] = data.data.matchPrice;

  await wait(5000);
  displayPortfolio();

  await wait(5000);
  startNewTradingSession(symbol);
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
  await displayPortfolio();
});
