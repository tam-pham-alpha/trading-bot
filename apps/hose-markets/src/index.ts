/* eslint-disable no-console */
import * as Sentry from '@sentry/node';
import './sentry';
import { BigQuery } from '@google-cloud/bigquery';

import config from './config';
import Streaming from './streaming';
import { TradeMessage, ForeignRoomMessage, IndexMessage } from './types/Market';
import { dataFetch, setDataAccessToken } from './utils/dataFetch';

type Market = {
  symbol: string;
  source: string;
  timestamp: number;
  price: number;
  volume: number;
};

type Trade = {
  symbol: string;
  source: string;
  timestamp: number;
  price: number;
  volume: number;
};

type ForeignRoom = {
  symbol: string;
  source: string;
  timestamp: number;
  total_room: number;
  current_room: number;
};

type Index = {
  symbol: string;
  source: string;
  timestamp: number;
  index_value: number;
  total_value: number;
};

const DATA_SET_ID = 'mavelli_tech';
const MARKET_DATA_TABLE = 'market_data';
const AGG_TRADES_TABLE = 'agg_trades';
const FOREIGN_ROOM_TABLE = 'foreign_room';
const INDEX_DATA_TABLE = 'index_data';

const bigquery = new BigQuery({
  projectId: 'mavelli-ssi',
  keyFilename: './mavelli-ssi-market-data.json',
});
const dataset = bigquery.dataset(DATA_SET_ID);

let MARKET_DATA: Record<string, Market> = {};
let AGG_TRADES: Trade[] = [];
let FOREIGN_ROOM: Record<string, ForeignRoom> = {};
let INDEX_DATA: Record<string, Index> = {};

const onTrade = (data: TradeMessage) => {
  const symbol = data.Symbol;
  const source = data.Exchange;
  const timestamp = Date.now();
  const price = data.LastPrice || data.RefPrice;

  MARKET_DATA[symbol] = {
    symbol,
    source,
    timestamp,
    price,
    volume: data.TotalVol,
  };

  AGG_TRADES.push({
    symbol,
    source,
    timestamp,
    price,
    volume: data.LastVol,
  });
};

const onForeignRoom = (data: ForeignRoomMessage) => {
  const symbol = data.Symbol;
  const source = data.Exchange;
  const timestamp = Date.now();

  FOREIGN_ROOM[symbol] = {
    symbol,
    source,
    timestamp,
    total_room: data.TotalRoom,
    current_room: data.CurrentRoom,
  };
};

const onIndex = (data: IndexMessage) => {
  const symbol = data.IndexId;
  const source = data.Exchange;
  const timestamp = Date.now();
  const indexValue = data.IndexValue;
  const totalValue = data.TotalValue;

  INDEX_DATA[symbol] = {
    symbol,
    source,
    timestamp,
    index_value: indexValue,
    total_value: totalValue,
  };
};

const insertMarkerDataIntoBigQuery = async (rows: Market[]) => {
  if (!rows.length) return;
  console.log('insertMarkerDataIntoBigQuery', rows.length);

  try {
    const table = dataset.table(MARKET_DATA_TABLE);

    // Insert the rows using the table.insert method
    await table.insert(rows);
  } catch (error) {
    console.log(`Error inserting market data into BigQuery:`, error);
  }
};

const insertAggTradesIntoBigQuery = async (rows: Trade[]) => {
  if (!rows.length) return;
  console.log('insertAggTradesIntoBigQuery', rows.length);

  try {
    const table = dataset.table(AGG_TRADES_TABLE);

    // Insert the rows using the table.insert method
    await table.insert(rows);
  } catch (error) {
    console.log(`Error inserting agg trades into BigQuery:`, error);
  }
};

const insertForeignRoomIntoBigQuery = async (rows: ForeignRoom[]) => {
  if (!rows.length) return;
  console.log('insertForeignRoomIntoBigQuery', rows.length);

  try {
    const table = dataset.table(FOREIGN_ROOM_TABLE);

    // Insert the rows using the table.insert method
    await table.insert(rows);
  } catch (error) {
    console.log(`Error inserting agg trades into BigQuery:`, error);
  }
};

const insertIndexDataIntoBigQuery = async (rows: Index[]) => {
  if (!rows.length) return;
  console.log('insertIndexDataIntoBigQuery', rows.length);

  try {
    const table = dataset.table(INDEX_DATA_TABLE);

    // Insert the rows using the table.insert method
    await table.insert(rows);
  } catch (error) {
    console.log(`Error inserting index data into BigQuery:`, error);
  }
};

const storeMarketDataIntoBigQuery = async () => {
  console.log('storeMarketDataIntoBigQuery', Date.now());
  insertMarkerDataIntoBigQuery(Object.values(MARKET_DATA));
  MARKET_DATA = {};

  setTimeout(() => {
    storeMarketDataIntoBigQuery();
  }, 60_000); // 1 min
};

const storeAggTradesIntoBigQuery = async () => {
  console.log('storeAggTradesIntoBigQuery', Date.now());
  insertAggTradesIntoBigQuery(AGG_TRADES);
  AGG_TRADES = [];

  setTimeout(() => {
    storeAggTradesIntoBigQuery();
  }, 30_000); // 30 seconds
};

const storeForeignRoomIntoBigQuery = async () => {
  console.log('storeForeignRoomIntoBigQuery', Date.now());
  insertForeignRoomIntoBigQuery(Object.values(FOREIGN_ROOM));
  FOREIGN_ROOM = {};

  setTimeout(() => {
    storeForeignRoomIntoBigQuery();
  }, 60_000); // 60 seconds
};

const storeIndexDataIntoBigQuery = async () => {
  console.log('storeIndexDataIntoBigQuery', Date.now());
  insertIndexDataIntoBigQuery(Object.values(INDEX_DATA));
  INDEX_DATA = {};

  setTimeout(() => {
    storeIndexDataIntoBigQuery();
  }, 60_000); // 60 seconds
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
            .invoke('FcMarketDataV2Hub', 'SwitchChannels', 'MI:ALL');
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

            if (type === 'X-TRADE') {
              onTrade(data as TradeMessage);
            }

            if (type === 'R') {
              onForeignRoom(data as ForeignRoomMessage);
            }

            if (type === 'MI') {
              console.log('MI', data);
              onIndex(data as IndexMessage);
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

  storeMarketDataIntoBigQuery();
  storeForeignRoomIntoBigQuery();
  storeAggTradesIntoBigQuery();
  storeIndexDataIntoBigQuery();

  // // update data after restarting
  setTimeout(() => {
    insertMarkerDataIntoBigQuery(Object.values(MARKET_DATA));
    insertForeignRoomIntoBigQuery(Object.values(FOREIGN_ROOM));
    insertIndexDataIntoBigQuery(Object.values(INDEX_DATA));
    insertAggTradesIntoBigQuery(AGG_TRADES);

    MARKET_DATA = {};
    FOREIGN_ROOM = {};
    INDEX_DATA = {};
    AGG_TRADES = [];
  }, 10_000); // 10 secs
};

main();
