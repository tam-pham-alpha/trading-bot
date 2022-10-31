import config from '../config';
import { OrderHistory } from '../types/Order';
import { getNumber } from '../utils/number';
import { cancelOrder, getOrderHistory, placeOrder } from './order';
import { getStockPosition } from './position';

export const placeBatchOrder = async (
  instrument: string,
  lastPrice: number,
) => {
  const positions = await getStockPosition();
  const currentPosition = positions.find((i) => i.instrumentID === instrument);
  const currentPrice = lastPrice || currentPosition?.avgPrice || 0;

  if (!currentPrice) {
    throw new Error('Unable to get the current price');
  }

  return Promise.all([
    placeOrder(
      instrument,
      getNumber((currentPrice * (100 - config.bot.levelPrice1)) / 100, 2),
      config.bot.levelQty1,
      'B',
    ),
    placeOrder(
      instrument,
      getNumber((currentPrice * (100 - config.bot.levelPrice2)) / 100, 2),
      config.bot.levelQty2,
      'B',
    ),
    placeOrder(
      instrument,
      getNumber((currentPrice * (100 - config.bot.levelPrice3)) / 100, 2),
      config.bot.levelQty3,
      'B',
    ),
    placeOrder(
      instrument,
      getNumber((currentPrice * (100 + config.bot.levelPrice1)) / 100, 2),
      config.bot.levelQty1,
      'S',
    ),
    placeOrder(
      instrument,
      getNumber((currentPrice * (100 + config.bot.levelPrice2)) / 100, 2),
      config.bot.levelQty2,
      'S',
    ),
    placeOrder(
      instrument,
      getNumber((currentPrice * (100 + config.bot.levelPrice3)) / 100, 2),
      config.bot.levelQty3,
      'S',
    ),
  ]);
};

export const cancelAllOrder = async () => {
  const orders = await getOrderHistory();

  return Promise.all(orders.map((i: OrderHistory) => cancelOrder(i.orderID)));
};
