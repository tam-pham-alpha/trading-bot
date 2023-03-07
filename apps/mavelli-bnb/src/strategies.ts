export type Strategy = {
  symbol: string;
  active: boolean;
  buyPrice: number;
  buyQuantity: number;
  holdQuantity: number;
  takeProfit: number;
  allocation: number;
  tickSize: number;
  interval: number;
};

export const defaultValue: Strategy = {
  symbol: '',
  active: false,
  buyPrice: -1.25,
  buyQuantity: 0.1,
  holdQuantity: 0.1,
  takeProfit: 2.45,
  allocation: 1,
  tickSize: 2,
  interval: 1800000,
};
