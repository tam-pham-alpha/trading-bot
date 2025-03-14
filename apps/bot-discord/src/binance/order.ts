import { TradeCommand } from '../utils/cmd';

export type FutureOrderData = TradeCommand & {
  quantity: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  price: number;
};

export const getPriceWithTickSize = (
  price: number,
  tickSize: number,
): number => {
  return Math.floor(price / tickSize) * tickSize;
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
    price: currentPrice,
    quantity,
    stopLossPrice,
    takeProfitPrice,
  };
};
