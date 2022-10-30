import config from '../config';
import { OrderHistory } from '../types/Order';
import { getNumber, toNumber } from '../utils/number';
import { getDailyStockPrice } from './market';
import { cancelOrder, getOrderHistory, placeOrder } from './order';
import { getStockPosition } from './position';

export const placeBatchOrder = async (instrument: string) => {
  const delta = config.bot.delta;

  const dailyMarket = await getDailyStockPrice(instrument);
  const positions = await getStockPosition();
  const currentPosition = positions.filter(
    (i) => i.instrumentID === instrument,
  );

  const currentPrice = toNumber(dailyMarket.RefPrice);
  const buyPrice = getNumber((currentPrice * (100 + delta)) / 100, 2);
  const sellPrice = getNumber((currentPrice * (100 - delta)) / 100, 2);

  return Promise.all([
    placeOrder(instrument, buyPrice, 100, 'B'),
    placeOrder(instrument, sellPrice, 100, 'S'),
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
