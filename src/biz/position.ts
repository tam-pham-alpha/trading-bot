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
  })
    .then((response) => {
      return response.data.data.stockPositions as StockPosition[];
    })
    .then((positions: StockPosition[]) => {
      let totalValue = 0;
      return positions
        .map((i) => {
          const total = i.buyT0 + i.buyT1 + i.buyT2 + i.sellableQty;
          const value = total * (i.marketPrice || i.avgPrice);
          totalValue += value;

          return {
            ...i,
            total,
            value,
          };
        })
        .map((i) => ({
          ...i,
          allocation: Math.round((i.value / totalValue) * 10000) / 100,
        }));
    });
};
