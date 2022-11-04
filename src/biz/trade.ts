import { strategies } from '../config';
import BalanceFactory from '../factory/BalanceFactory';
import PositionFactory from '../factory/PositionFactory';
import { getNumber } from '../utils/number';
import { placeOrder } from './order';

export const checkTolerantLoss = (
  tolerant: number,
  avgPrice: number,
  price: number,
) => {
  if (!avgPrice) return false;
  const acceptedPrice = (avgPrice * (100 - tolerant)) / 100;
  return price > acceptedPrice;
};

export const checkCrossProfit = (
  takeProfit: number,
  avgPrice: number,
  price: number,
) => {
  if (!avgPrice) return false;
  const acceptedPrice = (avgPrice * (100 + takeProfit)) / 100;
  return price > acceptedPrice;
};

export const placeTakeProfitOrder = async (
  instrument: string,
  lastPrice: number,
) => {
  const positionList = PositionFactory.positions;
  const position = positionList.find((i) => i.instrumentID === instrument);
  const strategy = strategies.find((i) => i.symbol === instrument);
  const avgPrice = position?.avgPrice || 0;
  const sellQty = position?.sellableQty || 0;

  if (
    !lastPrice ||
    !sellQty ||
    !strategy ||
    !checkCrossProfit(strategy.takeProfit, avgPrice, lastPrice)
  ) {
    return;
  }

  return await placeOrder(instrument, 'S', lastPrice, sellQty);
};

export const placeBatchOrder = async (
  instrument: string,
  lastPrice: number,
) => {
  const positionList = PositionFactory.positions;
  const balance = BalanceFactory.balance;

  const position = positionList.find((i) => i.instrumentID === instrument);
  const strategy = strategies.find((i) => i.symbol === instrument);
  const avgPrice = position?.avgPrice || 0;
  const allocation = position?.allocation || 0;

  if (!strategy || !lastPrice) return;

  const buyPrice = getNumber((lastPrice * (100 - strategy.buyLvPrc1)) / 100, 2);
  const qty =
    !avgPrice || avgPrice < buyPrice ? strategy.buyLvQty1 : strategy.buyLvQty2;

  // don't buy more
  if (allocation >= strategy.allocation) {
    console.log(`ERROR ${instrument}: reached the allocation`);
    return;
  }
  // insufficient balance
  if (buyPrice * qty > balance.purchasingPower) {
    console.log(`ERROR ${instrument}: insufficient balance`);
    return;
  }

  return placeOrder(instrument, 'B', buyPrice, qty);
};
