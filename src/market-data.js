const axios = require("axios");

const Streaming = require("./streaming");
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
      axios.interceptors.request.use((axios_config) => {
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
          .invoke("FcMarketDataV2Hub", "SwitchChannels", "MI:VN30");
        stream
          .getClient()
          .invoke("FcMarketDataV2Hub", "SwitchChannels", "F:SSI");
        stream
          .getClient()
          .invoke("FcMarketDataV2Hub", "SwitchChannels", "R:SSI");
        stream
          .getClient()
          .invoke("FcMarketDataV2Hub", "SwitchChannels", "B:SSI");
        stream
          .getClient()
          .invoke("FcMarketDataV2Hub", "SwitchChannels", "X-QUOTE:SSI");
        stream
          .getClient()
          .invoke("FcMarketDataV2Hub", "SwitchChannels", "X-TRADE:SSI");
      };

      stream.subscribe("FcMarketDataV2Hub", "Broadcast", (message) => {
        const resp = JSON.parse(message);
        const data = JSON.parse(resp.Content);
        console.log(resp.DataType, data);
      });

      stream.subscribe("FcMarketDataV2Hub", "Reconnected", (message) => {
        console.log("Reconnected" + message);
      });

      stream.subscribe("FcMarketDataV2Hub", "Disconnected", (message) => {
        console.log("Disconnected" + message);
      });

      stream.subscribe("FcMarketDataV2Hub", "Error", (message) => {
        console.log(message);
      });

      stream.start();
    } else {
      console.log(response.data.message);
    }
  },
  (reason) => {
    console.log(reason);
  }
);
