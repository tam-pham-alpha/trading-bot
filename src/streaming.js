const signalr = require("signalr-client");

function addSlash(str) {
  return str.substr(-1) !== "/" ? str + "/" : str;
}

var api = {
  SIGNALR: "signalr",
};

function resoleURL(baseURL, query) {
  return addSlash(baseURL) + query;
}

class Streaming {
  constructor(options) {
    var url = resoleURL(options.url, api.SIGNALR);
    this._client = new signalr.client(url, ["FcMarketDataV2Hub"], 10, true);

    this._client._eventsListener = [];
    this._client.headers["Authorization"] = options.token;

    this._client.serviceHandlers.connected = () => {
      this.connected();
    };
    this._client.serviceHandlers.reconnecting = () => {
      this.reconnecting();
    };
  }

  start = () => {
    this._client.start();
  };

  getClient = () => {
    return this._client;
  };

  subscribe = (channel, event, callback) => {
    this._client.on(channel, event, callback);
  };
}

module.exports = Streaming;
