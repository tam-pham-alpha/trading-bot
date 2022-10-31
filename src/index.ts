import axios from 'axios';
import express from 'express';
import ssi from 'ssi-api-client';

import { setAccessToken, fetch } from './utils/fetch';
import config from './config';
import apis from './biz/apis';

import { cancelAllOrder, placeBatchOrder } from './biz/trade';
import Streaming from './streaming';
import { getOrderHistory } from './biz/order';
import { getOrderTable } from './utils/table';

const INTERVAL = 1800000; // 30 mins

const app = express();
app.listen(config.port, 'localhost', () =>
  console.log(`Example app listening on port ${config.port}!`),
);

// SSI Market Data
const rqData = axios.create({
  baseURL: config.market.ApiUrl,
  timeout: 5000,
});

const marketInit = rqData({
  url: config.market.ApiUrl + 'AccessToken',
  method: 'post',
  data: {
    consumerID: config.market.ConsumerID,
    consumerSecret: config.market.ConsumerSecret,
  },
}).then(
  (resp) => {
    if (resp.data.status === 200) {
      const token = 'Bearer ' + resp.data.data.accessToken;
      axios.interceptors.request.use((axios_config: any) => {
        axios_config.headers.Authorization = token;
        return axios_config;
      });

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
          .invoke('FcMarketDataV2Hub', 'SwitchChannels', 'F:SSI');
        stream
          .getClient()
          .invoke('FcMarketDataV2Hub', 'SwitchChannels', 'R:SSI');
        stream
          .getClient()
          .invoke('FcMarketDataV2Hub', 'SwitchChannels', 'B:SSI');
        stream
          .getClient()
          .invoke('FcMarketDataV2Hub', 'SwitchChannels', 'X-QUOTE:SSI');
        stream
          .getClient()
          .invoke('FcMarketDataV2Hub', 'SwitchChannels', 'X-TRADE:SSI');
      };

      stream.subscribe('FcMarketDataV2Hub', 'Broadcast', (message: any) => {
        const resp = JSON.parse(message);
        const data = JSON.parse(resp.Content);
        // console.log(resp.DataType, data);
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
const tradingInit = fetch({
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

      ssi.bind(ssi.events.onError, function (e: any, data: any) {
        console.log(e, JSON.stringify(data));
      });

      ssi.bind(ssi.events.onOrderUpdate, function (e: any, data: any) {
        console.log(e, JSON.stringify(data));
      });

      ssi.bind(ssi.events.onOrderError, function (e: any, data: any) {
        console.log(e, JSON.stringify(data));
      });

      ssi.bind(ssi.events.onClientPortfolioEvent, function (e: any, data: any) {
        console.log(e, JSON.stringify(data));
      });

      ssi.bind(ssi.events.onOrderMatch, function (e: any, data: any) {
        console.log(e, JSON.stringify(data));
      });

      ssi.start();
      console.log('SSI Trading Started!');
    } else {
      console.log(resp.data.message);
    }

    return true;
  })
  .catch((reason) => {
    console.log(reason);
  });

Promise.all([marketInit, tradingInit]).then(() => {
  console.log('Auto Trading Started');

  const orderControl = async () => {
    console.log('A: Cancel all orders');
    await cancelAllOrder();

    const orders = (await getOrderHistory()).filter(
      (i) => i.orderStatus === 'QU',
    );

    if (orders.length === 0) {
      console.log('A: Place batch orders');

      await placeBatchOrder('SSI');
      const orders = await getOrderHistory();
      const filteredOrders = orders.filter((i) => i.orderStatus === 'QU');

      if (filteredOrders.length) {
        console.log('R: New orders');
        console.table(getOrderTable(filteredOrders));
      }
    } else {
      console.log('ERROR: Unable to cancel all orders.');
    }
  };

  orderControl();
  setInterval(() => {
    orderControl();
  }, INTERVAL);
});
