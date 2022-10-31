import config from '../config';
import { OrderHistory } from '../types/Order';
import { getNumber } from '../utils/number';
import { cancelOrder, getLiveOrder, placeOrder } from './order';
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
      getNumber((currentPrice * (100 - config.bot.buyLvPrc1)) / 100, 2),
      config.bot.buyLvQty1,
      'B',
    ),
    // placeOrder(
    //   instrument,
    //   getNumber((currentPrice * (100 + config.bot.sellLvPrc1)) / 100, 2),
    //   config.bot.sellLvQty1,
    //   'S',
    // ),
  ]);
};

export const cancelAllOrder = async () => {
  const orders = await getLiveOrder();
  return Promise.all(orders.map((i: OrderHistory) => cancelOrder(i.orderID)));
};
