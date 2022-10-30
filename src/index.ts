import express from 'express';
import ssi from 'ssi-api-client';

import { setAccessToken, fetch } from './utils/fetch';
import config from './config';
import apis from './biz/apis';

import './market-data';
import { cancelAllOrder } from './biz/trade';

const app = express();
app.listen(config.port, 'localhost', () =>
  console.log(`Example app listening on port ${config.port}!`),
);

fetch({
  url: ssi.api.GET_ACCESS_TOKEN,
  method: 'post',
  data: {
    consumerID: config.trading.ConsumerID,
    consumerSecret: config.trading.ConsumerSecret,
    twoFactorType: 0,
    code: config.pinCode,
    isSave: false,
  },
})
  .then((resp) => {
    if (resp.data.status === 200) {
      console.log(resp.data);

      const access_token = resp.data.data.accessToken;
      setAccessToken(access_token);

      apis(app, access_token);

      cancelAllOrder();

      ssi.initStream({
        url: config.trading.stream_url,
        access_token,
        notify_id: 0,
      });

      ssi.bind(ssi.events.onError, function (e: any, data: any) {
        console.log(e + ': ');
        console.log(data);
      });

      ssi.bind(ssi.events.onOrderUpdate, function (e: any, data: any) {
        console.log(e + ': ');
        console.log(JSON.stringify(data));
      });

      ssi.bind(ssi.events.onOrderError, function (e: any, data: any) {
        console.log(e + ': ');
        console.log(JSON.stringify(data));
      });

      ssi.bind(ssi.events.onClientPortfolioEvent, function (e: any, data: any) {
        console.log(e + ': ');
        console.log(JSON.stringify(data));
      });

      ssi.bind(ssi.events.onOrderMatch, function (e: any, data: any) {
        console.log(e + ': ');
        console.log(JSON.stringify(data));
      });

      ssi.start();
    } else {
      console.log(resp.data.message);
    }
  })
  .catch((reason) => {
    console.log(reason);
  });
