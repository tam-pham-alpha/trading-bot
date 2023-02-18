/* eslint-disable no-console */
import ssi from 'ssi-api-client';
import * as Sentry from '@sentry/node';
import './sentry';

import { setAccessToken, fetch } from './utils/fetch';
import { Strategy } from './strategies';
import config from './config';

import Streaming from './streaming';
import {
  getAccountTable,
  getOrderTable,
  getStockPositionTable,
  getStrategyTable,
} from './utils/table';
import { QuoteMessage, TradeMessage, TradingSession } from './types/Market';
import OrderFactory from './factory/OrderFactory';
import { OrderMatchEvent, OrderUpdateEvent } from './types/Order';
import BalanceFactory from './factory/BalanceFactory';
import PositionFactory from './factory/PositionFactory';
import { dataFetch, setDataAccessToken } from './utils/dataFetch';
import { wait } from './utils/time';
import { Mavelli } from './mavelli';

import { onConfigChange } from './spreadsheet/loadConfigs';
import { loadStrategies, onStrategyChange } from './spreadsheet/loadStrategies';
import { MavelliConfig } from './types/Mavelli';
import { toNumber } from 'lodash';
import { saveStatusToGG, SystemStatus } from './spreadsheet/saveStatusToGG';

let TIMESTAMP = 0;
let AGG_STRATEGIES: Strategy[] = [];
let SESSION: TradingSession;
// const SYNC_STATUS_INTERVAL = 300000; // 5 mins
const SYNC_STATUS_INTERVAL = 60000; // 5 mins
const BOT: Record<string, Mavelli> = {};

const displayStrategies = () => {
  console.log('R. STRATEGY');
  console.table(getStrategyTable(AGG_STRATEGIES));
};

const displayAccount = () => {
  console.log('R: ACCOUNT');
  console.table(getAccountTable([BalanceFactory.balance]));
};

const displayPositions = () => {
  const buyingList = PositionFactory.getBuyingList();
  console.log('R: POSITIONS');
  console.table(getStockPositionTable(PositionFactory.positions));
  console.log(
    `R. BUYING (${buyingList.length}):`,
    BalanceFactory.getIsBuying(),
    buyingList.join(', '),
  );
};

const displayOrders = () => {
  console.log(`R: LIVE ORDERS (${OrderFactory.getLiveOrders().length})`);
  console.table(getOrderTable(OrderFactory.getLiveOrders()));
};

const displayPortfolio = () => {
  displayStrategies();
  displayAccount();
  displayPositions();
  displayOrders();
};

const updatePortfolio = async () => {
  await wait(1000);
  await BalanceFactory.update();

  await wait(1000);
  await PositionFactory.update();

  await wait(1000);
  await OrderFactory.update();

  displayPortfolio();
};

const onSessionUpdate = async (session: TradingSession) => {
  SESSION = session;

  Object.values(BOT).forEach((b) => {
    b.setSession(session);
  });
};

const onLastPrice = (symbol: string, price: number) => {
  if (BOT[symbol] && price) {
    BOT[symbol].setLastPrice(price);
  }
};

const onTrade = (data: TradeMessage) => {
  const symbol = data.Symbol;
  const price = data.LastPrice;

  if (BOT[symbol]) {
    BOT[symbol].setTrade(data);
  }

  onLastPrice(symbol, price);
};

const onQuote = (data: QuoteMessage) => {
  const symbol = data.Symbol;
  const price = data.BidPrice1;

  if (BOT[symbol]) {
    BOT[symbol].setQuote(data);
  }

  onLastPrice(symbol, price);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onOrderUpdate = async (e: any, data: OrderUpdateEvent) => {
  const order = data.data;
  const symbol = order.instrumentID;
  console.log('onOrderUpdate A', order);

  // ignore old events
  const modifiedTime = order.inputTime;
  if (toNumber(modifiedTime) < TIMESTAMP) {
    return;
  }
  console.log('onOrderUpdate B', order);

  if (BOT[symbol]) {
    BOT[symbol].onOrderUpdate(data);
  }

  if (OrderFactory.getLiveOrders().length) {
    console.log(`R: LIVE ORDERS (${OrderFactory.getLiveOrders().length})`);
    console.table(getOrderTable(OrderFactory.getLiveOrders()));
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onOrderMatch = async (e: any, data: OrderMatchEvent) => {
  const order = data.data;
  const symbol = order.instrumentID;

  // ignore old events
  const matchTime = data.data.matchTime;
  if (parseInt(matchTime) < TIMESTAMP) {
    return;
  }

  console.log('R: ORDER MATCH');

  await wait(1000);
  await updatePortfolio();

  if (BOT[symbol]) {
    await wait(1000);
    BOT[symbol].onOrderMatch(data);
  }
};

const initSsiMarketData = () => {
  return dataFetch({
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

        const symbolList = AGG_STRATEGIES.map((i) => i.symbol).join('-');

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

        stream.disconnected = () => {
          Sentry.captureMessage('Market Data got disconnected', {
            tags: {
              domain: 'SSI MARKET',
            },
          });
          // pm2 will restart the process then
          process.exit();
        };

        stream.subscribe(
          'FcMarketDataV2Hub',
          'Broadcast',
          (message: string) => {
            const resp = JSON.parse(message);
            const type = resp.DataType;
            const data = JSON.parse(resp.Content);

            if (type === 'F' && data.MarketId === 'HOSE') {
              const session = data.TradingSession as TradingSession;
              onSessionUpdate(session);
            }

            if (type === 'X-TRADE') {
              onTrade(data as TradeMessage);
            }

            if (type === 'X-QUOTE') {
              onQuote(data as QuoteMessage);
            }
          },
        );

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
};

const initSsiTrading = () => {
  return fetch({
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

        ssi.initStream({
          url: config.trading.stream_url,
          access_token,
          notify_id: 0,
        });

        ssi.bind(ssi.events.onOrderUpdate, onOrderUpdate);

        ssi.bind(ssi.events.onOrderMatch, onOrderMatch);

        ssi.bind(ssi.events.onError, (e: any, data: any) => {
          console.log('OnError', JSON.stringify(data));
          Sentry.captureMessage(JSON.stringify(data), {
            tags: {
              type: 'onError',
            },
          });
        });
        ssi.bind(ssi.events.onOrderError, (e: any, data: any) => {
          console.log('onOrderError', JSON.stringify(data));
          Sentry.captureMessage(JSON.stringify(data), {
            tags: {
              type: 'onOrderError',
            },
          });
        });
        ssi.bind(ssi.events.onClientPortfolioEvent, (e: any, data: any) => {
          console.log('onClientPortfolioEvent', JSON.stringify(data));
          Sentry.captureMessage(JSON.stringify(data), {
            tags: {
              type: 'onClientPortfolioEvent',
            },
          });
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
};

const syncSystemStatus = async () => {
  await OrderFactory.orderCheck();

  const status: SystemStatus = {
    timestamp: Date.now(),
    totalAssets: BalanceFactory.getTotalAsset(),
    purchasingPower: BalanceFactory.getPurchasingPower(),
    buyingTokens:
      PositionFactory.getBuyingList()
        .map((i) => {
          const token = AGG_STRATEGIES.find((s) => s.symbol === i);
          return `${i}@${token?.buyPrc ?? '???'}`;
        })
        .join(', ') || '-',
    liveOrders:
      OrderFactory.getLiveOrders()
        .map(
          (i) => `${i.buySell}-${i.instrumentID}:q-${i.quantity}:p-${i.price}`,
        )
        .join(', ') || '-',
  };

  if (!status.totalAssets) return;

  saveStatusToGG(status);
};

const initSyncStatus = () => {
  syncSystemStatus();

  setInterval(() => {
    syncSystemStatus();
  }, SYNC_STATUS_INTERVAL);
};

const main = async () => {
  TIMESTAMP = Date.now();
  console.log('Mavelli SSI started!', TIMESTAMP);

  AGG_STRATEGIES = await loadStrategies();
  PositionFactory.setStrategies(AGG_STRATEGIES);

  const ssiData = initSsiMarketData();
  const ssiTrading = initSsiTrading();

  Promise.all([ssiData, ssiTrading]).then(async () => {
    await updatePortfolio();

    if (OrderFactory.getLiveOrders().length) {
      await OrderFactory.cancelAllOrders();
      await wait(1000);
      await OrderFactory.update();
      displayOrders();
    }

    AGG_STRATEGIES.forEach((i) => {
      BOT[i.symbol] = new Mavelli(i.symbol, i);
      BOT[i.symbol].setSession(SESSION);
      BOT[i.symbol].setReady();
    });
  });

  onConfigChange((data: MavelliConfig) => {
    BalanceFactory.setCashInventory(data.cashInventory);
    PositionFactory.setConfig(data);
    displayPortfolio();
  });

  onStrategyChange((list: Strategy[]) => {
    AGG_STRATEGIES = list;
    PositionFactory.setStrategies(AGG_STRATEGIES);

    displayStrategies();
    displayPositions();

    const symbols = list.map((i) => i.symbol).join(', ');
    const updatedStrategies = AGG_STRATEGIES.filter(
      (i) => symbols.indexOf(i.symbol) >= 0,
    );
    updatedStrategies.forEach((i) => {
      if (BOT[i.symbol]) {
        BOT[i.symbol].setStrategy(i);
      }
    });
  });

  // sync current status to gg spreadsheets
  initSyncStatus();
};

main();
