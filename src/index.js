/*
 * Created on Wed Nov 11 2020 by ducdv
 *
 * Copyright (c) 2020 SSI
 */

/** @START_CONFIG */
const express = require("express");
const client = require("fctrading-client");
const axios = require("axios");

const marketStreaming = require("./Streamings/marketStreaming");
const dataConfig = require("./config.js");

const app = express();
const port = 3011;
const rn = require("random-number");
Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

function parseBool(str) {
  return str === "true" || str === true;
}
var date = new Date();

//This is config for consumer have permission on all customer
var config = {
  ConsumerID: "3fac428fb91b4b7a8b9ff6fd150023e4",
  ConsumerSecret: "3d74ec034f99413db86e459a80af62e0",
  PublicKey:
    "PFJTQUtleVZhbHVlPjxNb2R1bHVzPnhET3lGUW5vUWV5STFKRUk5ZFVyd2ZBeUlOSUI4ckxIdTIwRFU5bjRrQlgySHVNekkyYU1tR0orZ1hSRzBiMTF5Wk1RdFg1YTkvRnRGSnVrUVhiYVg3cEtnUGgwYm91dlFyTkszc2gxWnB4Sk9laVFIc25tVkxNSE05ZForQjdVUlFHeXMwUmhPTEUyYVF6ZS9qMWN0V1o1Tkw1UERJL05ncWw1dGUrdU9QMD08L01vZHVsdXM+PEV4cG9uZW50PkFRQUI8L0V4cG9uZW50PjwvUlNBS2V5VmFsdWU+",
  PrivateKey:
    "PFJTQUtleVZhbHVlPjxNb2R1bHVzPnhET3lGUW5vUWV5STFKRUk5ZFVyd2ZBeUlOSUI4ckxIdTIwRFU5bjRrQlgySHVNekkyYU1tR0orZ1hSRzBiMTF5Wk1RdFg1YTkvRnRGSnVrUVhiYVg3cEtnUGgwYm91dlFyTkszc2gxWnB4Sk9laVFIc25tVkxNSE05ZForQjdVUlFHeXMwUmhPTEUyYVF6ZS9qMWN0V1o1Tkw1UERJL05ncWw1dGUrdU9QMD08L01vZHVsdXM+PEV4cG9uZW50PkFRQUI8L0V4cG9uZW50PjxQPjVaZWpEQ1VRaXZkMWEvazBzcVFmZUY5MkcvaExlQm93YnRqLzhCbkRSR2k3QzM3cUNBeGVJMnV1aUx2Z01KTVFTSGI3aENlSk1jbmVjVTArYXNVT1N3PT08L1A+PFE+MnNUZ1JuTEE5anVKS3hOTnQrKzZUcFA0VlhMYVg2cmhmMEFiTjFYQXZYT29iUjRKbzB2YnRxRU44akovZ0NJM0F3NjdNRWkrNFVCaUpXRHJQNnFvMXc9PTwvUT48RFA+Vm9lOEQ4dTRYR2UvZlo1QzJrRTVDeWtQWHFOSjdrNFFpdmFHSDN2V09HWXdlTGl3ZzdBRm10dnV2K0h2TU45OGQ1TkFZQ0oyZHFsYWlPRlA4UFdyMlE9PTwvRFA+PERRPmxnK1pyM2tqZDBOYlVacktJck5qM21hTlh6K0xIemc5dVdXbHhZMGl5bEU5Wkt2SC9LVWFMdW5HZ1MyMlc1UWNuQkpNd0ZBRjdzaVZDZ0t6RzFiYXZRPT08L0RRPjxJbnZlcnNlUT5hY0FEeVZTbjc1ZlVHU2l0WWFlVDVLSC9EZnlsNC82dWNvSTFUdjJBZVJtekdhLy9rWG4xTDZoT0tEVmJsM1Evc0VQSDdiWklyWkFHcE9GMVpxOTZJdz09PC9JbnZlcnNlUT48RD5XSmFhNXVMMVNxYlpWVmt6T1lTSjRHUnF6ZVRrMmtlYzVXU2dad0Q1T1YyaEptc2hrTzlodGdCcTdGcXJDMUxIVnorZkFNUFBvVG9TTFlibEVHWHd6UlBuUUdyZWhNM1NOQktvbVo0T0ZEL1RJQzVvdERybmg3VlJhRFl0MzBXaEt1Vnh1M1FHMnNJZDMveDVMNjJFZjdPTms3QXpOSGE4MXgyVGFIOXZiTVU9PC9EPjwvUlNBS2V5VmFsdWU+",

  URL: "https://fc-tradeapi.ssi.com.vn",
  stream_url: "wss://fc-tradehub.ssi.com.vn/",
};
var configServer = config;
const rq = axios.create({
  baseURL: config.URL,
  timeout: 5000,
});
/** @END_CONFIG */
var mockStockData = {
  account: "1577921",
  buysell: "B",
  market: "VN", // Only support "VN" and "VNFE"
  ordertype: "LO",
  price: 25000,
  quantity: 300,
  instrumentid: "SSI",
  validitydate: date.yyyymmdd(),
  channel: "IW",
  extOrderID: "", // this property is unique in day.
  session: "",
  code: "1we23rw4t",
  twoFaType: 0,
  startDate: "24/05/2019",
  endDate: "30/05/2019",
};
var mockDeterativeData = {
  account: "1577926",
  buysell: "B",
  currency: "KVND",
  market: "VNFE",
  ordertype: "LO", // Only support "VN" and "VNFE"
  price: 1425,
  quantity: 10,
  instrumentid: "VN30F2209",
  validitydate: date.yyyymmdd(),
  channel: "WT",
  extOrderID: "",
  stoporder: false,
  stopprice: 800,
  stoptype: "D",
  stopstep: 0.5,
  lossstep: 0,
  profitstep: 0,
  session: "",
  code: "674870",
  querySummary: true,
  startDate: "29/08/2019",
  endDate: "29/08/2019",
};
var access_token = "";

rq({
  url: client.api.GET_ACCESS_TOKEN,
  method: "post",
  data: {
    consumerID: config.ConsumerID,
    consumerSecret: config.ConsumerSecret,
    twoFactorType: 0,
    code: mockStockData.code,
    isSave: false,
  },
}).then(
  (response) => {
    if (response.data.status === 200) {
      access_token = response.data.data.accessToken;
      console.log(response.data);
      client.initStream({
        url: config.stream_url,
        access_token: response.data.data.accessToken,
        notify_id: 0,
      });
      client.bind(client.events.onError, function (e, data) {
        //Process data ...
        console.log(e + ": ");
        console.log(data);
      });
      client.bind(client.events.onOrderUpdate, function (e, data) {
        //Process data ...
        console.log(e + ": ");
        console.log(JSON.stringify(data));
      });
      client.bind(client.events.onOrderError, function (e, data) {
        //Process data ...
        console.log(e + ": ");
        console.log(JSON.stringify(data));
      });
      client.bind(client.events.onClientPortfolioEvent, function (e, data) {
        //Process data ...
        console.log(e + ": ");
        console.log(JSON.stringify(data));
      });
      client.bind(client.events.onOrderMatch, function (e, data) {
        //Process data ...
        console.log(e + ": ");
        console.log(JSON.stringify(data));
      });
      client.start();
    } else {
      console.log(response.data.message);
    }
  },
  (reason) => {
    console.log(reason);
  }
);
var getRandom = rn.generator({
  min: 0,
  max: 99999999,
  integer: true,
});
app.get("/getOtp", (req, res) => {
  var request = {
    consumerID: config.ConsumerID,
    consumerSecret: config.ConsumerSecret,
  };
  rq({
    url: client.api.GET_OTP,
    method: "post",

    data: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/verifyCode", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    consumerID: config.ConsumerID,
    consumerSecret: config.ConsumerSecret,
    twoFactorType: parseInt(ro.twoFaType),
    code: ro.code,
    isSave: true,
  };
  rq({
    url: client.api.GET_ACCESS_TOKEN,
    method: "post",
    data: request,
  })
    .then((response) => {
      if (response.data.status === 200) {
        access_token = response.data.data.accessToken;
        console.log("Access Token for order: " + access_token);
      }
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/newOrder", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    instrumentID: ro.instrumentid,
    market: ro.market,
    buySell: ro.buysell,
    orderType: ro.ordertype,
    channelID: ro.channel,
    price: parseFloat(ro.price),
    quantity: parseInt(ro.quantity),
    account: ro.account,
    requestID: getRandom() + "",
    stopOrder: false,
    stopPrice: 0,
    stopType: "string",
    stopStep: 0,
    lossStep: 0,
    profitStep: 0,
    code: ro.code,
  };
  rq({
    url: client.api.NEW_ORDER,
    method: "post",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
      [client.constants.SIGNATURE_HEADER]: client.sign(
        JSON.stringify(request),
        config.PrivateKey
      ),
    },
    data: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/ttlNewOrder", (req, res) => {
  var ro = {};
  Object.assign(ro, mockDeterativeData);
  Object.assign(ro, req.query);
  var request = {
    instrumentID: ro.instrumentid,
    market: ro.market,
    buySell: ro.buysell,
    orderType: ro.ordertype,
    channelID: ro.channel,
    price: parseFloat(ro.price),
    quantity: parseInt(ro.quantity),
    account: ro.account,
    requestID: getRandom() + "",
    stopOrder: parseBool(ro.stoporder),
    stopPrice: parseFloat(ro.stopprice),
    stopType: ro.stoptype,
    stopStep: parseFloat(ro.stopstep),
    lossStep: parseFloat(ro.lossstep),
    profitStep: parseFloat(ro.profitstep),
    code: ro.code,
  };
  rq({
    url: client.api.NEW_ORDER,
    method: "post",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
      [client.constants.SIGNATURE_HEADER]: client.sign(
        JSON.stringify(request),
        config.PrivateKey
      ),
    },
    data: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/modifyOrder", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    orderID: ro.orderid,
    price: parseFloat(ro.price),
    quantity: parseInt(ro.quantity),
    account: ro.account,
    instrumentID: ro.instrumentid,
    marketID: ro.market,
    buySell: ro.buysell,
    requestID: getRandom() + "",
    orderType: ro.ordertype,
    code: ro.code,
  };
  rq({
    url: client.api.MODIFY_ORDER,
    method: "post",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
      [client.constants.SIGNATURE_HEADER]: client.sign(
        JSON.stringify(request),
        config.PrivateKey
      ),
    },
    data: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/ttlmodifyOrder", (req, res) => {
  var ro = {};
  Object.assign(ro, mockDeterativeData);
  Object.assign(ro, req.query);
  var request = {
    orderID: ro.orderid,
    price: parseFloat(ro.price),
    quantity: parseInt(ro.quantity),
    account: ro.account,
    instrumentID: ro.instrumentid,
    marketID: ro.market,
    buySell: ro.buysell,
    requestID: getRandom() + "",
    orderType: ro.ordertype,
    code: ro.code,
  };
  rq({
    url: client.api.MODIFY_ORDER,
    method: "post",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
      [client.constants.SIGNATURE_HEADER]: client.sign(
        JSON.stringify(request),
        config.PrivateKey
      ),
    },
    data: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/cancelOrder", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    orderID: ro.orderid,
    account: ro.account,
    instrumentID: ro.instrumentid,
    marketID: ro.market,
    buySell: ro.buysell,
    requestID: getRandom() + "",
    code: ro.code,
  };
  rq({
    url: client.api.CANCEL_ORDER,
    method: "post",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
      [client.constants.SIGNATURE_HEADER]: client.sign(
        JSON.stringify(request),
        config.PrivateKey
      ),
    },
    data: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/ttlcancelOrder", (req, res) => {
  var ro = {};
  Object.assign(ro, mockDeterativeData);
  Object.assign(ro, req.query);
  var request = {
    orderID: ro.orderid,
    account: ro.account,
    instrumentID: ro.instrumentid,
    marketID: ro.market,
    buySell: ro.buysell,
    requestID: getRandom() + "",
    code: ro.code,
  };
  rq({
    url: client.api.CANCEL_ORDER,
    method: "post",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
      [client.constants.SIGNATURE_HEADER]: client.sign(
        JSON.stringify(request),
        config.PrivateKey
      ),
    },
    data: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/orderHistory", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
    startDate: ro.startDate,
    endDate: ro.endDate,
  };
  rq({
    url: client.api.GET_ORDER_HISTORY,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/ttlorderHistory", (req, res) => {
  var ro = {};
  Object.assign(ro, mockDeterativeData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
    startDate: ro.startDate,
    endDate: ro.endDate,
  };
  rq({
    url: client.api.GET_ORDER_HISTORY,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/derPosition", (req, res) => {
  var ro = {};
  Object.assign(ro, mockDeterativeData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
    querySummary: parseBool(ro.querySummary),
  };
  rq({
    url: client.api.GET_DER_POSITION,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/stockPosition", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
  };
  rq({
    url: client.api.GET_STOCK_POSITION,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/maxBuyQty", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
    instrumentID: ro.instrumentid,
    price: parseFloat(ro.price),
  };
  rq({
    url: client.api.GET_MAX_BUY_QUANTITY,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/ttlmaxBuyQty", (req, res) => {
  var ro = {};
  Object.assign(ro, mockDeterativeData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
    instrumentID: ro.instrumentid,
    price: parseFloat(ro.price),
  };
  rq({
    url: client.api.GET_MAX_BUY_QUANTITY,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/maxSellQty", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
    instrumentID: ro.instrumentid,
  };
  rq({
    url: client.api.GET_MAX_SELL_QUANTITY,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/ttlmaxSellQty", (req, res) => {
  var ro = {};
  Object.assign(ro, mockDeterativeData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
    instrumentID: ro.instrumentid,
    price: parseFloat(ro.price),
  };
  rq({
    url: client.api.GET_MAX_SELL_QUANTITY,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/accountBalance", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
  };
  rq({
    url: client.api.GET_ACCOUNT_BALANCE,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});
app.get("/derAccountBalance", (req, res) => {
  var ro = {};
  Object.assign(ro, mockDeterativeData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
  };
  rq({
    url: client.api.GET_DER_ACCOUNT_BALANCE,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get("/ppmmraccount", (req, res) => {
  var ro = {};
  Object.assign(ro, mockStockData);
  Object.assign(ro, req.query);
  var request = {
    account: ro.account,
  };
  rq({
    url: client.api.GET_PPMMRACCOUNT,
    method: "get",
    headers: {
      [client.constants.AUTHORIZATION_HEADER]:
        client.constants.AUTHORIZATION_SCHEME + " " + access_token,
    },
    params: request,
  })
    .then((response) => {
      res.send(JSON.stringify(response.data));
    })
    .catch((error) => {
      res.send(error);
    });
});

const rqData = axios.create({
  baseURL: dataConfig.market.ApiUrl,
  timeout: 5000,
});

rqData({
  url: dataConfig.market.ApiUrl + "AccessToken",
  method: "post",
  data: {
    consumerID: dataConfig.market.ConsumerID,
    consumerSecret: dataConfig.market.ConsumerSecret,
  },
}).then(
  (response) => {
    if (response.data.status === 200) {
      let token = "Bearer " + response.data.data.accessToken;
      axios.interceptors.request.use(function (axios_config) {
        axios_config.headers.Authorization = token;
        return axios_config;
      });

      marketStreaming.initStream({
        url: dataConfig.market.HubUrl,
        token: token,
      });

      var mkClient = marketStreaming.start();

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

app.listen(port, "localhost", () =>
  console.log(`Example app listening on port ${port}!`)
);
