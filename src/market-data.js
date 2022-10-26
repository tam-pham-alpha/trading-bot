const axios = require("axios");

const streaming = require("./streaming");
const config = require("./config.js");

const rqData = axios.create({
  baseURL: config.market.ApiUrl,
  timeout: 5000,
});

rqData({
  url: config.market.ApiUrl + "AccessToken",
  method: "post",
  data: {
    consumerID: config.market.ConsumerID,
    consumerSecret: config.market.ConsumerSecret,
  },
}).then(
  (response) => {
    if (response.data.status === 200) {
      let token = "Bearer " + response.data.data.accessToken;
      axios.interceptors.request.use(function (axios_config) {
        axios_config.headers.Authorization = token;
        return axios_config;
      });

      streaming.initStream({
        url: config.market.HubUrl,
        token: token,
      });

      var mkClient = streaming.start();

      mkClient.serviceHandlers.connected = function (connection) {
        mkClient.invoke("FcMarketDataV2Hub", "SwitchChannels", "X-QUOTE:ALL");
      };

      mkClient.serviceHandlers.reconnecting = function (connection) {
        mkClient.invoke("FcMarketDataV2Hub", "SwitchChannels", "X:ALL");
      };
    } else {
      console.log(response.data.message);
    }
  },
  (reason) => {
    console.log(reason);
  }
);
