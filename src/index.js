const express = require("express");
const client = require("ssi-api-client");
const axios = require("axios");

const config = require("./config.js");
const apis = require("./apis");

require("./market-data");

const app = express();
app.listen(config.port, "localhost", () =>
  console.log(`Example app listening on port ${config.port}!`)
);

const rq = axios.create({
  baseURL: config.trading.URL,
  timeout: 5000,
});

rq({
  url: client.api.GET_ACCESS_TOKEN,
  method: "post",
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

      // init bulk of apis
      apis(app, access_token);

      client.initStream({
        url: config.trading.stream_url,
        access_token,
        notify_id: 0,
      });

      client.bind(client.events.onError, function (e, data) {
        console.log(e + ": ");
        console.log(data);
      });

      client.bind(client.events.onOrderUpdate, function (e, data) {
        console.log(e + ": ");
        console.log(JSON.stringify(data));
      });

      client.bind(client.events.onOrderError, function (e, data) {
        console.log(e + ": ");
        console.log(JSON.stringify(data));
      });

      client.bind(client.events.onClientPortfolioEvent, function (e, data) {
        console.log(e + ": ");
        console.log(JSON.stringify(data));
      });

      client.bind(client.events.onOrderMatch, function (e, data) {
        console.log(e + ": ");
        console.log(JSON.stringify(data));
      });

      client.start();
    } else {
      console.log(resp.data.message);
    }
  })
  .catch((reason) => {
    console.log(reason);
  });
