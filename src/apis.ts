// @ts-nocheck

import client from 'ssi-api-client';
import rn from 'random-number';
import { fetch } from './utils/fetch';

import config from './config';
import { mockDerivativeData, mockStockData } from './mock';

const getRandom = rn.generator({
  min: 0,
  max: 99999999,
  integer: true,
});

const parseBool = (str: string) => {
  return str === 'true' || str === true;
};

export default function (app: any, access_token: string) {
  app.get('/getOtp', (req, res) => {
    const request = {
      consumerID: config.trading.ConsumerID,
      consumerSecret: config.trading.ConsumerSecret,
    };

    fetch({
      url: client.api.GET_OTP,
      method: 'post',

      data: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/verifyCode', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      consumerID: config.trading.ConsumerID,
      consumerSecret: config.trading.ConsumerSecret,
      twoFactorType: parseInt(ro.twoFaType),
      code: ro.code,
      isSave: true,
    };

    fetch({
      url: client.api.GET_ACCESS_TOKEN,
      method: 'post',
      data: request,
    })
      .then((response) => {
        if (response.data.status === 200) {
          access_token = response.data.data.accessToken;
          console.log('Access Token for order: ' + access_token);
        }
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/newOrder', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      instrumentID: ro.instrumentid,
      market: ro.market,
      buySell: ro.buysell,
      orderType: ro.ordertype,
      channelID: ro.channel,
      price: parseFloat(ro.price),
      quantity: parseInt(ro.quantity),
      account: ro.account,
      requestID: getRandom() + '',
      stopOrder: false,
      stopPrice: 0,
      stopType: 'string',
      stopStep: 0,
      lossStep: 0,
      profitStep: 0,
      code: ro.code,
    };

    fetch({
      url: client.api.NEW_ORDER,
      method: 'post',
      headers: {
        [client.constants.SIGNATURE_HEADER]: client.sign(
          JSON.stringify(request),
          config.trading.PrivateKey,
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

  app.get('/ttlNewOrder', (req, res) => {
    const ro = {};
    Object.assign(ro, mockDerivativeData);
    Object.assign(ro, req.query);
    const request = {
      instrumentID: ro.instrumentid,
      market: ro.market,
      buySell: ro.buysell,
      orderType: ro.ordertype,
      channelID: ro.channel,
      price: parseFloat(ro.price),
      quantity: parseInt(ro.quantity),
      account: ro.account,
      requestID: getRandom() + '',
      stopOrder: parseBool(ro.stoporder),
      stopPrice: parseFloat(ro.stopprice),
      stopType: ro.stoptype,
      stopStep: parseFloat(ro.stopstep),
      lossStep: parseFloat(ro.lossstep),
      profitStep: parseFloat(ro.profitstep),
      code: ro.code,
    };

    fetch({
      url: client.api.NEW_ORDER,
      method: 'post',
      headers: {
        [client.constants.SIGNATURE_HEADER]: client.sign(
          JSON.stringify(request),
          config.trading.PrivateKey,
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

  app.get('/modifyOrder', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      orderID: ro.orderid,
      price: parseFloat(ro.price),
      quantity: parseInt(ro.quantity),
      account: ro.account,
      instrumentID: ro.instrumentid,
      marketID: ro.market,
      buySell: ro.buysell,
      requestID: getRandom() + '',
      orderType: ro.ordertype,
      code: ro.code,
    };

    fetch({
      url: client.api.MODIFY_ORDER,
      method: 'post',
      headers: {
        [client.constants.SIGNATURE_HEADER]: client.sign(
          JSON.stringify(request),
          config.trading.PrivateKey,
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

  app.get('/ttlmodifyOrder', (req, res) => {
    const ro = {};
    Object.assign(ro, mockDerivativeData);
    Object.assign(ro, req.query);
    const request = {
      orderID: ro.orderid,
      price: parseFloat(ro.price),
      quantity: parseInt(ro.quantity),
      account: ro.account,
      instrumentID: ro.instrumentid,
      marketID: ro.market,
      buySell: ro.buysell,
      requestID: getRandom() + '',
      orderType: ro.ordertype,
      code: ro.code,
    };

    fetch({
      url: client.api.MODIFY_ORDER,
      method: 'post',
      headers: {
        [client.constants.SIGNATURE_HEADER]: client.sign(
          JSON.stringify(request),
          config.trading.PrivateKey,
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

  app.get('/cancelOrder', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      orderID: ro.orderid,
      account: ro.account,
      instrumentID: ro.instrumentid,
      marketID: ro.market,
      buySell: ro.buysell,
      requestID: getRandom() + '',
      code: ro.code,
    };

    fetch({
      url: client.api.CANCEL_ORDER,
      method: 'post',
      headers: {
        [client.constants.SIGNATURE_HEADER]: client.sign(
          JSON.stringify(request),
          config.trading.PrivateKey,
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

  app.get('/ttlcancelOrder', (req, res) => {
    const ro = {};
    Object.assign(ro, mockDerivativeData);
    Object.assign(ro, req.query);
    const request = {
      orderID: ro.orderid,
      account: ro.account,
      instrumentID: ro.instrumentid,
      marketID: ro.market,
      buySell: ro.buysell,
      requestID: getRandom() + '',
      code: ro.code,
    };

    fetch({
      url: client.api.CANCEL_ORDER,
      method: 'post',
      headers: {
        [client.constants.SIGNATURE_HEADER]: client.sign(
          JSON.stringify(request),
          config.trading.PrivateKey,
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

  app.get('/orderHistory', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
      startDate: ro.startDate,
      endDate: ro.endDate,
    };

    fetch({
      url: client.api.GET_ORDER_HISTORY,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/ttlorderHistory', (req, res) => {
    const ro = {};
    Object.assign(ro, mockDerivativeData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
      startDate: ro.startDate,
      endDate: ro.endDate,
    };

    fetch({
      url: client.api.GET_ORDER_HISTORY,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/derPosition', (req, res) => {
    const ro = {};
    Object.assign(ro, mockDerivativeData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
      querySummary: parseBool(ro.querySummary),
    };

    fetch({
      url: client.api.GET_DER_POSITION,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/stockPosition', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
    };

    fetch({
      url: client.api.GET_STOCK_POSITION,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/maxBuyQty', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
      instrumentID: ro.instrumentid,
      price: parseFloat(ro.price),
    };

    fetch({
      url: client.api.GET_MAX_BUY_QUANTITY,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/ttlmaxBuyQty', (req, res) => {
    const ro = {};
    Object.assign(ro, mockDerivativeData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
      instrumentID: ro.instrumentid,
      price: parseFloat(ro.price),
    };

    fetch({
      url: client.api.GET_MAX_BUY_QUANTITY,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/maxSellQty', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
      instrumentID: ro.instrumentid,
    };

    fetch({
      url: client.api.GET_MAX_SELL_QUANTITY,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/ttlmaxSellQty', (req, res) => {
    const ro = {};
    Object.assign(ro, mockDerivativeData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
      instrumentID: ro.instrumentid,
      price: parseFloat(ro.price),
    };

    fetch({
      url: client.api.GET_MAX_SELL_QUANTITY,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/derAccountBalance', (req, res) => {
    const ro = {};
    Object.assign(ro, mockDerivativeData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
    };

    fetch({
      url: client.api.GET_DER_ACCOUNT_BALANCE,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/ppmmraccount', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
    };

    fetch({
      url: client.api.GET_PPMMRACCOUNT,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });

  app.get('/accountBalance', (req, res) => {
    const ro = {};
    Object.assign(ro, mockStockData);
    Object.assign(ro, req.query);
    const request = {
      account: ro.account,
    };

    fetch({
      url: client.api.GET_ACCOUNT_BALANCE,
      method: 'get',
      params: request,
    })
      .then((response) => {
        res.send(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.send(error);
      });
  });
}
