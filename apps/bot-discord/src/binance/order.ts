import { TradeCommand } from '../utils/cmd';

export type FutureOrderData = TradeCommand & {
  quantity: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  price: number;
};

export const getNumberWithPrecision = (
  number: number,
  precision: number,
): number => {
  return Math.floor(number * Math.pow(10, precision)) / Math.pow(10, precision);
};

export const getFutureOrderData = (
  cmd: TradeCommand,
  currentPrice: number,
): FutureOrderData => {
  const quantity = cmd.qtyUsd / currentPrice;
  let stopLossPrice = currentPrice,
    takeProfitPrice = currentPrice;

  if (cmd.side === 'LONG') {
    stopLossPrice = (currentPrice * (100 - cmd.stopLoss)) / 100;
    takeProfitPrice = (currentPrice * (100 + cmd.takeProfit)) / 100;
  } else {
    stopLossPrice = (currentPrice * (100 + cmd.stopLoss)) / 100;
    takeProfitPrice = (currentPrice * (100 - cmd.takeProfit)) / 100;
  }

  return {
    ...cmd,
    quantity: getNumberWithPrecision(quantity, 3),
    price: getNumberWithPrecision(currentPrice, 1),
    stopLossPrice: getNumberWithPrecision(stopLossPrice, 1),
    takeProfitPrice: getNumberWithPrecision(takeProfitPrice, 1),
  };
};
