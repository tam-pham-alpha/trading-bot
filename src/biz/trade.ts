import config from '../config';
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

export const placeBatchOrder = async (
  instrument: string,
  lastPrice: number,
) => {
  const positionList = PositionFactory.positions;
  const balance = BalanceFactory.balance;

  const position = positionList.find((i) => i.instrumentID === instrument);
  const strategy = config.strategies.find((i) => i.symbol === instrument);
  const avgPrice = position?.avgPrice || 0;

  if (!strategy) return;

  if (!lastPrice) {
    throw new Error('Unable to get the current price');
  }

  return Promise.all([
    (async () => {
      const buyPrice = getNumber(
        (lastPrice * (100 - strategy.buyLvPrc1)) / 100,
        2,
      );

      const qty =
        !avgPrice || avgPrice < buyPrice
          ? strategy.buyLvQty1
          : strategy.buyLvQty2;

      // insufficient balance
      if (buyPrice * qty > balance.purchasingPower) {
        return;
      }

      return placeOrder(instrument, 'B', buyPrice, qty);
    })(),
    (async () => {
      const sellPrice = getNumber(
        (lastPrice * (100 + strategy.sellLvPrc1)) / 100,
        2,
      );

      const qty =
        !avgPrice || avgPrice > sellPrice
          ? strategy.sellLvQty1
          : strategy.sellLvQty2;

      if ((position?.sellableQty || 0) < qty) {
        return;
      }

      // don't sell low
      if (!checkTolerantLoss(strategy.tolerantLoss, avgPrice, sellPrice)) {
        return;
      }

      return placeOrder(instrument, 'S', sellPrice, qty);
    })(),
  ]);
};
