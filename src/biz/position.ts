import client from 'ssi-api-client';

import { spot } from '../mock';
import { StockPosition } from '../types/Position';
import { fetch } from '../utils/fetch';

export const getStockPosition = async () => {
  const request = {
    account: spot.account,
  };

  return fetch({
    url: client.api.GET_STOCK_POSITION,
    method: 'get',
    params: request,
  }).then((response) => {
    return response.data.data.stockPositions as StockPosition[];
  });
};
