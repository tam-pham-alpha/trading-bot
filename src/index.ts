/* eslint-disable no-console */
import ssi from 'ssi-api-client';
import * as Sentry from '@sentry/node';

import { setAccessToken, fetch } from './utils/fetch';
import { INTERVAL, strategies, Strategy } from './strategies';
import config from './config';

import {
  fetchStrategies,
  FirebaseStrategy,
  onDataChange,
} from './firestore/strategies';

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
import { mergeStrategies } from './utils/strategy';
import { based } from './strategies';

import './sentry';
import {
  fetchDefaultStrategy,
  fetchMavelliConfig,
  onDefaultStrategyChange,
  onMavelliConfigChange,
} from './firestore/configs';
import { MAX_ORDER } from './consts';

let TIMESTAMP = 0;
let AGG_STRATEGIES: Strategy[] = strategies;
let DEFAULT_STRATEGY: Strategy = based;
const BOT: Record<string, Mavelli> = {};

const displayStrategies = () => {
  console.log('R. STRATEGY');
  console.table(getStrategyTable(AGG_STRATEGIES));
};

const displayAccount = async () => {
  await BalanceFactory.update();
  console.log('R: ACCOUNT');
  console.table(getAccountTable([BalanceFactory.balance]));
};

const displayPositions = async () => {
  await PositionFactory.update();
  const buyingList = PositionFactory.getBuyingList();
  console.log('R: POSITIONS');
  console.table(getStockPositionTable(PositionFactory.positions));
  console.log(`R. BUYING (${buyingList.length}):`, buyingList.join(', '));
};

const displayOrders = async () => {
  await OrderFactory.update();
  console.log(`R: LIVE ORDERS (${OrderFactory.getLiveOrders().length})`);
  console.table(getOrderTable(OrderFactory.getLiveOrders()));
};

const displayPortfolio = async () => {
  displayStrategies();

  await wait(1000);
  await displayAccount();

  await wait(1000);
  await displayPositions();

  await wait(1000);
  await displayOrders();
};

const onSessionUpdate = (session: TradingSession) => {
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

  // ignore old events
  const modifiedTime = order.modifiedTime;
  if (parseInt(modifiedTime) < TIMESTAMP) {
    return;
  }

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
  displayPortfolio();

  await wait(1000);
  BOT[symbol].onOrderMatch(data);
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
          Sentry.captureMessage(JSON.stringify(data), {
            tags: {
              type: 'onError',
            },
          });
        });
        ssi.bind(ssi.events.onOrderError, (e: any, data: any) => {
          Sentry.captureMessage(JSON.stringify(data), {
            tags: {
              type: 'onOrderError',
            },
          });
        });
        ssi.bind(ssi.events.onClientPortfolioEvent, (e: any, data: any) => {
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

const main = async () => {
  TIMESTAMP = Date.now();
  console.log('Mavelli SSI started!', TIMESTAMP);

  const defaultStrategy = await fetchDefaultStrategy();
  const strategyList = await fetchStrategies();

  DEFAULT_STRATEGY = { ...DEFAULT_STRATEGY, ...defaultStrategy };
  AGG_STRATEGIES = mergeStrategies(
    AGG_STRATEGIES,
    strategyList,
    DEFAULT_STRATEGY,
  );

  PositionFactory.setStrategies(AGG_STRATEGIES);
  AGG_STRATEGIES.forEach((i) => {
    BOT[i.symbol] = new Mavelli(i.symbol, i);
  });

  const ssiData = initSsiMarketData();
  const ssiTrading = initSsiTrading();

  Promise.all([ssiData, ssiTrading]).then(async () => {
    await displayPortfolio();
    await OrderFactory.cancelAllOrders();

    Object.values(BOT).forEach((b) => {
      b.setReady();
    });
  });

  // update data every 10 mins
  setInterval(() => {
    console.log('setInterval');
    displayPortfolio();
  }, INTERVAL.m10);

  // set default config
  fetchMavelliConfig().then((data) => {
    PositionFactory.setMaxOrder(data.maxOrder || MAX_ORDER);
  });
  onMavelliConfigChange((data) => {
    PositionFactory.setMaxOrder(data.maxOrder || MAX_ORDER);
  });

  onDefaultStrategyChange((data) => {
    DEFAULT_STRATEGY = { ...DEFAULT_STRATEGY, ...data };
    AGG_STRATEGIES = mergeStrategies(AGG_STRATEGIES, [], DEFAULT_STRATEGY);
    PositionFactory.setStrategies(AGG_STRATEGIES);

    console.log('R. STRATEGY');
    console.table(getStrategyTable(AGG_STRATEGIES));

    AGG_STRATEGIES.forEach((i) => {
      if (BOT[i.symbol]) {
        BOT[i.symbol].setStrategy(i);
      }
    });
  });

  onDataChange((list: FirebaseStrategy[]) => {
    AGG_STRATEGIES = mergeStrategies(AGG_STRATEGIES, list, DEFAULT_STRATEGY);
    PositionFactory.setStrategies(AGG_STRATEGIES);

    console.log('R. STRATEGY');
    console.table(getStrategyTable(AGG_STRATEGIES));

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
};

main();
