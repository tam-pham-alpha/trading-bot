import config from './config';

export const spot = {
  code: config.pinCode,
  account: config.spotAccount,
  buySell: 'B',
  market: 'VN', // Only support "VN" and "VNFE"
  orderType: 'LO',
  price: 25000,
  quantity: 300,
  instrumentID: 'SSI',
  channel: 'IW',
  extOrderID: '', // this property is unique in day.
  session: '',
  twoFaType: 0,
  startDate: '20/10/2022',
  endDate: '27/10/2022',
};

export const deri = {
  account: '1577926',
  buySell: 'B',
  currency: 'KVND',
  market: 'VNFE',
  orderType: 'LO', // Only support "VN" and "VNFE"
  price: 1425,
  quantity: 10,
  instrumentID: 'VN30F2209',
  channel: 'WT',
  extOrderID: '',
  stopOrder: false,
  stopPrice: 800,
  stopType: 'D',
  stopStep: 0.5,
  lossStep: 0,
  profitStep: 0,
  session: '',
  code: config.pinCode,
  querySummary: true,
  startDate: '20/10/2022',
  endDate: '27/10/2022',
};
