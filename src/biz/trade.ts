import config from '../config';
import { OrderHistory } from '../types/Order';
import { getNumber } from '../utils/number';
import { cancelOrder, getOrderHistory, placeOrder } from './order';
import { getStockPosition } from './position';

export const placeBatchOrder = async (instrument: string) => {
  const delta = config.bot.delta;

  const positions = await getStockPosition();
  const currentPosition = positions.find((i) => i.instrumentID === instrument);

  const currentPrice = currentPosition?.avgPrice;

  if (!currentPrice) {
    throw new Error('Unable to get the current price');
  }

  const sellPrice = getNumber((currentPrice * (100 + delta)) / 100, 2);
  const buyPrice = getNumber((currentPrice * (100 - delta)) / 100, 2);

  console.log('Place order: ', instrument, 'S', sellPrice, 100);
  console.log('Place order: ', instrument, 'B', buyPrice, 100);

  return Promise.all([
    placeOrder(instrument, sellPrice, 100, 'S'),
    placeOrder(instrument, buyPrice, 100, 'B'),
  ]);
};

export const cancelAllOrder = async () => {
  const orders = await getOrderHistory();

  return Promise.all(
    orders
      .filter((i) => i.orderStatus === 'QU')
      .map((i: OrderHistory) => cancelOrder(i.orderID)),
  );
};
