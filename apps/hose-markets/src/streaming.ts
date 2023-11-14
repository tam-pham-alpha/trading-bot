// @ts-ignore
import signalr from 'signalr-client';

const addSlash = (str: string) => {
  return str.substr(-1) !== '/' ? str + '/' : str;
};

const api = {
  SIGNALR: 'v2.0/signalr',
};

const resoleURL = (baseURL: string, query: string) => {
  return addSlash(baseURL) + query;
};

class Streaming {
  _client: any;
  connected: () => void;
  reconnecting: () => void;
  disconnected: () => void;

  constructor(options: any) {
    const url = resoleURL(options.url, api.SIGNALR);
    this._client = new signalr.client(url, ['FcMarketDataV2Hub'], 10, true);

    this.connected = () => null;
    this.reconnecting = () => null;
    this.disconnected = () => null;

    this._client._eventsListener = [];
    this._client.headers['Authorization'] = options.token;

    this._client.serviceHandlers.connected = () => {
      this.connected();
    };
    this._client.serviceHandlers.reconnecting = () => {
      this.reconnecting();
    };
    this._client.serviceHandlers.disconnected = () => {
      this.disconnected();
    };
  }

  start = () => {
    this._client.start();
  };

  getClient = () => {
    return this._client;
  };

  subscribe = (
    channel: string,
    event: string,
    callback: (message: string) => void,
  ) => {
    this._client.on(channel, event, callback);
  };
}

export default Streaming;
