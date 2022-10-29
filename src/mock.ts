import config from './config';

export const mockStockData = {
  code: config.pinCode,
  account: config.spotAccount,
  buysell: 'B',
  market: 'VN', // Only support "VN" and "VNFE"
  ordertype: 'LO',
  price: 25000,
  quantity: 300,
  instrumentid: 'SSI',
  channel: 'IW',
  extOrderID: '', // this property is unique in day.
  session: '',
  twoFaType: 0,
  startDate: '20/10/2022',
  endDate: '27/10/2022',
};

export const mockDerivativeData = {
  account: '1577926',
  buysell: 'B',
  currency: 'KVND',
  market: 'VNFE',
  ordertype: 'LO', // Only support "VN" and "VNFE"
  price: 1425,
  quantity: 10,
  instrumentid: 'VN30F2209',
  channel: 'WT',
  extOrderID: '',
  stoporder: false,
  stopprice: 800,
  stoptype: 'D',
  stopstep: 0.5,
  lossstep: 0,
  profitstep: 0,
  session: '',
  code: config.pinCode,
  querySummary: true,
  startDate: '20/10/2022',
  endDate: '27/10/2022',
};
