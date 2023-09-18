/* eslint-disable no-console */
import * as Sentry from '@sentry/node';
import './sentry';
import { BigQuery } from '@google-cloud/bigquery';

import config from './config';
import Streaming from './streaming';
import { QuoteMessage, TradeMessage, TradingSession } from './types/Market';
import { dataFetch, setDataAccessToken } from './utils/dataFetch';

type Market = {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
  source: 'hose' | 'hnx' | 'upcom';
};

const DATA_SET_ID = 'mavelli_tech';
const MARKET_DATA_TABLE = 'market_data';

const bigquery = new BigQuery({
  projectId: 'mavelli-ssi',
  keyFilename: './mavelli-ssi-market-data.json',
});
const dataset = bigquery.dataset(DATA_SET_ID);
let MARKET_DATA: Record<string, Market> = {};

const onSessionUpdate = async (session: TradingSession) => {};

const onQuote = (data: QuoteMessage) => {};

const insertDataIntoBigQuery = async (rows: Market[]) => {
  if (!rows.length) return;
  console.log('insertDataIntoBigQuery', rows.length);

  try {
    const table = dataset.table(MARKET_DATA_TABLE);

    // Insert the rows using the table.insert method
    await table.insert(rows);
  } catch (error) {
    console.log(`Error inserting data into BigQuery:`, error);
  }
};

const storeDataIntoBigQuery = async () => {
  console.log('storeDataIntoBigQuery');
  insertDataIntoBigQuery(Object.values(MARKET_DATA));
  MARKET_DATA = {};

  setTimeout(() => {
    storeDataIntoBigQuery();
  }, 60_000); // 5 min
};

const onTrade = (data: TradeMessage) => {
  const symbol = data.Symbol;

  MARKET_DATA[symbol] = {
    symbol,
    source: 'hose',
    timestamp: Date.now(),
    price: data.LastPrice,
    volume: data.TotalVol,
  };
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

        stream.connected = () => {
          stream
            .getClient()
            .invoke('FcMarketDataV2Hub', 'SwitchChannels', 'MI:VN30');
          stream
            .getClient()
            .invoke('FcMarketDataV2Hub', 'SwitchChannels', `F:ALL`);
          stream
            .getClient()
            .invoke('FcMarketDataV2Hub', 'SwitchChannels', `R:ALL`);
          stream
            .getClient()
            .invoke('FcMarketDataV2Hub', 'SwitchChannels', `B:ALL`);
          stream
            .getClient()
            .invoke('FcMarketDataV2Hub', 'SwitchChannels', `X-QUOTE:ALL`);
          stream
            .getClient()
            .invoke('FcMarketDataV2Hub', 'SwitchChannels', `X-TRADE:ALL`);
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
            const data = JSON.parse(resp.Content);
            const type = resp.DataType;

            if (type === 'F' && data.MarketId === 'HOSE') {
              const session = data.TradingSession as TradingSession;
              onSessionUpdate(session);
            }

            if (type === 'X-QUOTE') {
              onQuote(data as QuoteMessage);
            }

            if (type === 'X-TRADE') {
              onTrade(data as TradeMessage);
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

const main = async () => {
  console.log('HOSE MARKETS!', Date.now());
  initSsiMarketData();
  storeDataIntoBigQuery();

  setTimeout(() => {
    insertDataIntoBigQuery(Object.values(MARKET_DATA));
  }, 10_000); // 10 secs
};

main();
