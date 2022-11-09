const m15 = 900000;

export type Strategy = {
  symbol: string;
  interval: number;

  buyLvPrc1: number;
  buyLvPrc2: number;

  buyLvQty1: number;
  buyLvQty2: number;

  takeProfit: number;
  allocation: number;
  tolerantLoss: number;
};

export const INTERVAL = {
  m10: 600000, // 10 mins
  m15: 900000, // 15 mins
  m20: 1200000, // 20 mins
  m30: 1800000, // 30 mins
  m45: 2700000, // 45 mins
  m60: m15 * 4,
  h02: m15 * 8,
  h04: m15 * 16,
};

const delta = 1.15;

const based: Strategy = {
  symbol: '',
  interval: INTERVAL.m60,

  buyLvPrc1: -1.95 * delta,
  buyLvPrc2: -2.45 * delta,
  buyLvQty1: 100,
  buyLvQty2: 100,

  takeProfit: 2.85,
  allocation: 7,
  tolerantLoss: 0,
};

export const strategies: Strategy[] = [
  {
    ...based,
    symbol: 'SSI',
    interval: INTERVAL.m45,
    buyLvPrc1: -2.25 * delta,
    buyLvPrc2: -1.95 * delta,
    buyLvQty1: 200,
    buyLvQty2: 400,
    allocation: 15,
  },
  {
    ...based,
    symbol: 'HAG',
    interval: INTERVAL.m60,
    buyLvPrc1: -2.25 * delta,
    buyLvQty1: 200,
    buyLvQty2: 400,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'TCB',
    interval: INTERVAL.m45,
    buyLvPrc1: -2.25 * delta,
    buyLvQty1: 100,
    buyLvQty2: 300,
    allocation: 25,
  },
  {
    ...based,
    symbol: 'FPT',
    interval: INTERVAL.m45,
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'HPG',
    interval: INTERVAL.m45,
    buyLvQty1: 200,
    buyLvQty2: 400,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'MSN',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.75 * delta,
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 25,
  },
  {
    ...based,
    symbol: 'VNM',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.45 * delta,
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 25,
  },
  {
    ...based,
    symbol: 'VHC',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.75 * delta,
    buyLvQty1: 100,
    buyLvQty2: 100,
  },
  {
    ...based,
    symbol: 'REE',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.95 * delta,
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'BID',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.35 * delta,
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 25,
  },
  {
    ...based,
    symbol: 'VJC',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.65 * delta,
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 5,
  },
  {
    ...based,
    symbol: 'VCB',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.55 * delta,
    buyLvQty1: 100,
    buyLvQty2: 100,
  },
  {
    ...based,
    symbol: 'DGC',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.85 * delta,
    buyLvQty1: 300,
    buyLvQty2: 500,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'MBB',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.85 * delta,
    buyLvQty1: 300,
    buyLvQty2: 300,
    allocation: 10,
  },
  {
    ...based,
    symbol: 'CTG',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.85 * delta,
    buyLvQty1: 200,
    buyLvQty2: 200,
    allocation: 1,
  },
  {
    ...based,
    symbol: 'DCM',
    interval: INTERVAL.m45,
    buyLvPrc1: -1.95 * delta,
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
    symbol: 'FRT',
    interval: INTERVAL.m45,
    buyLvQty1: 100,
    buyLvQty2: 100,
    allocation: 1,
  },
];

export default {
  port: 3011,
  pinCode: '1we23rw4t',
  spotAccount: '1577921',
  market: {
    HubUrl: 'wss://fc-data.ssi.com.vn/v2.0/',
    ApiUrl: 'https://fc-data.ssi.com.vn/api/v2/Market/',
    ConsumerID: '3fac428fb91b4b7a8b9ff6fd150023e4',
    ConsumerSecret: '709d06294cf14dc9a1d19ff6dd4ca573',
  },
  trading: {
    URL: 'https://fc-tradeapi.ssi.com.vn',
    stream_url: 'wss://fc-tradehub.ssi.com.vn/',
    ConsumerID: '3fac428fb91b4b7a8b9ff6fd150023e4',
    ConsumerSecret: '3d74ec034f99413db86e459a80af62e0',
    PublicKey:
      'PFJTQUtleVZhbHVlPjxNb2R1bHVzPnhET3lGUW5vUWV5STFKRUk5ZFVyd2ZBeUlOSUI4ckxIdTIwRFU5bjRrQlgySHVNekkyYU1tR0orZ1hSRzBiMTF5Wk1RdFg1YTkvRnRGSnVrUVhiYVg3cEtnUGgwYm91dlFyTkszc2gxWnB4Sk9laVFIc25tVkxNSE05ZForQjdVUlFHeXMwUmhPTEUyYVF6ZS9qMWN0V1o1Tkw1UERJL05ncWw1dGUrdU9QMD08L01vZHVsdXM+PEV4cG9uZW50PkFRQUI8L0V4cG9uZW50PjwvUlNBS2V5VmFsdWU+',
    PrivateKey:
      'PFJTQUtleVZhbHVlPjxNb2R1bHVzPnhET3lGUW5vUWV5STFKRUk5ZFVyd2ZBeUlOSUI4ckxIdTIwRFU5bjRrQlgySHVNekkyYU1tR0orZ1hSRzBiMTF5Wk1RdFg1YTkvRnRGSnVrUVhiYVg3cEtnUGgwYm91dlFyTkszc2gxWnB4Sk9laVFIc25tVkxNSE05ZForQjdVUlFHeXMwUmhPTEUyYVF6ZS9qMWN0V1o1Tkw1UERJL05ncWw1dGUrdU9QMD08L01vZHVsdXM+PEV4cG9uZW50PkFRQUI8L0V4cG9uZW50PjxQPjVaZWpEQ1VRaXZkMWEvazBzcVFmZUY5MkcvaExlQm93YnRqLzhCbkRSR2k3QzM3cUNBeGVJMnV1aUx2Z01KTVFTSGI3aENlSk1jbmVjVTArYXNVT1N3PT08L1A+PFE+MnNUZ1JuTEE5anVKS3hOTnQrKzZUcFA0VlhMYVg2cmhmMEFiTjFYQXZYT29iUjRKbzB2YnRxRU44akovZ0NJM0F3NjdNRWkrNFVCaUpXRHJQNnFvMXc9PTwvUT48RFA+Vm9lOEQ4dTRYR2UvZlo1QzJrRTVDeWtQWHFOSjdrNFFpdmFHSDN2V09HWXdlTGl3ZzdBRm10dnV2K0h2TU45OGQ1TkFZQ0oyZHFsYWlPRlA4UFdyMlE9PTwvRFA+PERRPmxnK1pyM2tqZDBOYlVacktJck5qM21hTlh6K0xIemc5dVdXbHhZMGl5bEU5Wkt2SC9LVWFMdW5HZ1MyMlc1UWNuQkpNd0ZBRjdzaVZDZ0t6RzFiYXZRPT08L0RRPjxJbnZlcnNlUT5hY0FEeVZTbjc1ZlVHU2l0WWFlVDVLSC9EZnlsNC82dWNvSTFUdjJBZVJtekdhLy9rWG4xTDZoT0tEVmJsM1Evc0VQSDdiWklyWkFHcE9GMVpxOTZJdz09PC9JbnZlcnNlUT48RD5XSmFhNXVMMVNxYlpWVmt6T1lTSjRHUnF6ZVRrMmtlYzVXU2dad0Q1T1YyaEptc2hrTzlodGdCcTdGcXJDMUxIVnorZkFNUFBvVG9TTFlibEVHWHd6UlBuUUdyZWhNM1NOQktvbVo0T0ZEL1RJQzVvdERybmg3VlJhRFl0MzBXaEt1Vnh1M1FHMnNJZDMveDVMNjJFZjdPTms3QXpOSGE4MXgyVGFIOXZiTVU9PC9EPjwvUlNBS2V5VmFsdWU+',
  },
};
