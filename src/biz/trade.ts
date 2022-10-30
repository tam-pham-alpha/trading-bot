import { OrderHistory } from '../types/Order';
import { getNumber, toNumber } from '../utils/number';
import { getDailyStockPrice } from './market';
import { cancelOrder, getOrderHistory, placeOrder } from './order';

export const placeBatchOrder = async (instrument: string) => {
  console.log('trade.placeBatchOrder');
  const percent = 2;

  const dailyMarket = await getDailyStockPrice(instrument);
  const currentPrice = toNumber(dailyMarket.RefPrice);

  const buyPrice = getNumber((currentPrice * (100 + percent)) / 100, 2);
  const sellPrice = getNumber((currentPrice * (100 - percent)) / 100, 2);

  placeOrder(instrument, buyPrice, 100, 'B');
  placeOrder(instrument, sellPrice, 100, 'S');
};

export const cancelAllOrder = async () => {
  console.log('trade.cancelAllOrder');
  const orders = await getOrderHistory();

  return Promise.all(
    orders
      .filter((i) => i.orderStatus === 'QU')
      .map((i: OrderHistory) => cancelOrder(i.orderID)),
  );
};
