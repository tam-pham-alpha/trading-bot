import axios from 'axios';
import { format, add } from 'date-fns';
import config from '../config';
import { DailyStockPrice } from '../types/Market';

export const getDailyStockPrice = (symbol: string) => {
  const today = new Date();

  const lookupRequest = {
    symbol: symbol,
    market: '',
    fromDate: format(add(today, { days: -2 }), 'dd/MM/yyyy'),
    toDate: format(add(today, { days: -2 }), 'dd/MM/yyyy'),
    pageIndex: 1,
    pageSize: 1000,
  };

  return axios
    .get(
      config.market.ApiUrl +
        'DailyStockPrice' +
        '?lookupRequest.symbol=' +
        lookupRequest.symbol +
        '&lookupRequest.fromDate=' +
        lookupRequest.fromDate +
        '&lookupRequest.toDate=' +
        lookupRequest.toDate +
        '&lookupRequest.pageIndex=' +
        lookupRequest.pageIndex +
        '&lookupRequest.pageSize=' +
        lookupRequest.pageSize +
        '&lookupRequest.market=' +
        lookupRequest.market,
    )
    .then((response) => {
      return response.data.data[0] as DailyStockPrice;
    });
};
