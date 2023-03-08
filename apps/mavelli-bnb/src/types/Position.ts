export type Position = {
  symbol: string;
  quantity: number;
  avgPrice: number;
  takeProfit: number;
  tpPrice: number;
  expectedPnl: number;
  valid: boolean;
};

export type StockPosition = {
  marketID: string;
  instrumentID: string;
  onHand: number;
  block: number;
  bonus: number;
  buyT0: number;
  buyT1: number;
  buyT2: number;
  sellT0: number;
  sellT1: number;
  sellT2: number;
  avgPrice: number;
  mortgage: number;
  sellableQty: number;
  holdForTrade: number;
  marketPrice: number;
  total: number;
  value: number;
  allocation: number;
  target: number;
  buying: boolean;
  delta: number;
};

export type SheetPosition = {
  symbol: string;
  quantity: number;
  avgPrice: number;
  takeProfit: number;
  tpPrice: number;
  expectedPnl: number;
  valid: boolean;
  marketPrice: number;
  holdQuantity: number;
};
