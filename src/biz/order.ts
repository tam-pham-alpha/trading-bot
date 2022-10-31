import client from 'ssi-api-client';
import { format } from 'date-fns';

import { fetch } from '../utils/fetch';
import { spot } from '../mock';
import { getRandom } from '../utils/number';
import config from '../config';
import { OrderHistory, Side } from '../types/Order';

export const getOrderHistory = async () => {
  const today = new Date();
  const request = {
    account: spot.account,
    startDate: format(today, 'dd/MM/yyyy'),
    endDate: format(today, 'dd/MM/yyyy'),
  };

  return fetch({
    url: client.api.GET_ORDER_HISTORY,
    method: 'get',
    params: request,
  }).then((resp: any) => {
    return resp.data.data.orderHistories as OrderHistory[];
  });
};

export const getLiveOrder = async () => {
  const orders = await getOrderHistory();
  return orders.filter(
    (i) =>
      i.orderStatus === 'WA' ||
      i.orderStatus === 'RS' ||
      i.orderStatus === 'SD' ||
      i.orderStatus === 'QU' ||
      i.orderStatus === 'PF',
  );
};

export const placeOrder = async (
  instrument: string,
  price: number,
  quantity: number,
  side: Side,
) => {
  const request = {
    market: spot.market,
    orderType: spot.orderType,
    channelID: spot.channel,
    account: spot.account,
    requestID: getRandom(),

    instrumentID: instrument,
    buySell: side,
    price,
    quantity,

    stopOrder: false,
    stopPrice: 0,
    stopType: '',
    stopStep: 0,
    lossStep: 0,
    profitStep: 0,
    code: spot.code,
  };

  return fetch({
    url: client.api.NEW_ORDER,
    method: 'post',
    headers: {
      [client.constants.SIGNATURE_HEADER]: client.sign(
        JSON.stringify(request),
        config.trading.PrivateKey,
      ),
    },
    data: request,
  }).then((response) => {
    return response.data.data;
  });
};

export const cancelOrder = async (orderId: string) => {
  const request = {
    orderID: orderId,
    account: spot.account,
    instrumentID: spot.instrumentID,
    marketID: spot.market,
    buySell: spot.buySell,
    requestID: getRandom().toString(),
    code: spot.code,
  };

  return fetch({
    url: client.api.CANCEL_ORDER,
    method: 'post',
    headers: {
      [client.constants.SIGNATURE_HEADER]: client.sign(
        JSON.stringify(request),
        config.trading.PrivateKey,
      ),
    },
    data: request,
  }).then((response) => {
    return response.data.data;
  });
};
