import { roundByDp } from './utils/number';

const m15 = 900000;

export type Strategy = {
  symbol: string;
  interval: number;

  buyLvPrc1: number;
  buyLvQty1: number;
  buyLvQty2: number;

  takeProfit: number;
  allocation: number;
};

export const INTERVAL = {
  m01: 60000,
  m10: 600000, // 10 mins
  m15: 900000, // 15 mins
  m20: 1200000, // 20 mins
  m30: 1800000, // 30 mins
  m45: 2700000, // 45 mins
  m60: m15 * 4,
  h02: m15 * 8,
  h04: m15 * 16,
};

const delta = 1.25;

const based: Strategy = {
  symbol: '',
  interval: INTERVAL.m60,

  buyLvPrc1: roundByDp(-2.55 * delta, 2),
  buyLvQty1: 100,
  buyLvQty2: 100,

  takeProfit: 3.25,
  allocation: 1,
};

export const strategies: Strategy[] = [
  {
    ...based,
    symbol: 'SSI',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-2.25 * delta, 2),
    takeProfit: 20.5,
    buyLvQty1: 400,
    buyLvQty2: 600,
    allocation: 20,
  },
  {
    ...based,
    symbol: 'TCB',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-2.25 * delta, 2),
    takeProfit: 20.5,
    buyLvQty1: 200,
    buyLvQty2: 300,
    allocation: 15,
  },
  {
    ...based,
    symbol: 'MSN',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.75 * delta, 2),
    buyLvQty1: 200,
    buyLvQty2: 200,
    allocation: 15,
  },
  {
    ...based,
    symbol: 'VNM',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.45 * delta, 2),
    buyLvQty1: 200,
    buyLvQty2: 200,
    allocation: 15,
  },
  {
    ...based,
    symbol: 'VHC',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.75 * delta, 2),
    buyLvQty1: 200,
    buyLvQty2: 200,
    allocation: 5,
  },
  {
    ...based,
    symbol: 'BID',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-0.75 * delta, 2),
    takeProfit: 7.25,
    buyLvQty1: 200,
    buyLvQty2: 200,
    allocation: 15,
  },
  {
    ...based,
    symbol: 'HAG',
    interval: INTERVAL.m60,
    buyLvPrc1: roundByDp(-2.25 * delta, 2),
    takeProfit: 20.5,
    buyLvQty1: 200,
    buyLvQty2: 400,
    allocation: 5,
  },
  {
    ...based,
    symbol: 'FPT',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.25 * delta, 2),
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'HPG',
    interval: INTERVAL.m45,
    takeProfit: 20.5,
    buyLvQty1: 200,
    buyLvQty2: 400,
    allocation: 10,
  },
  {
    ...based,
    symbol: 'REE',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.95 * delta, 2),
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'VJC',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.65 * delta, 2),
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: -1,
  },
  {
    ...based,
    symbol: 'VCB',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.15 * delta, 2),
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'MBB',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.85 * delta, 2),
    buyLvQty1: 300,
    buyLvQty2: 300,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'DGC',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.85 * delta, 2),
    buyLvQty1: 300,
    buyLvQty2: 500,
    allocation: -1,
  },
  {
    ...based,
    symbol: 'CTG',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.85 * delta, 2),
    buyLvQty1: 200,
    buyLvQty2: 200,
    allocation: -1,
  },
  {
    ...based,
    symbol: 'DCM',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-1.95 * delta, 2),
    buyLvQty1: 200,
    buyLvQty2: 200,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'TPB',
    interval: INTERVAL.m45,
    buyLvQty1: 200,
    buyLvQty2: 200,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'MWG',
    interval: INTERVAL.m45,
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'GVR',
    interval: INTERVAL.m45,
    buyLvPrc1: roundByDp(-2.05 * delta, 2),
    buyLvQty1: 500,
    buyLvQty2: 500,
    allocation: 5,
  },
];
