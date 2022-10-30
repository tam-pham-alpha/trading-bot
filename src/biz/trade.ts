import { OrderHistory } from '../types/Order';
import { cancelOrder, getOrderHistory } from './order';

export const placeBatchOrder = () => {};

export const cancelAllOrder = async () => {
  const orders = await getOrderHistory();

  return Promise.all(
    orders
      .filter((i) => i.orderStatus === 'QU')
      .map((i: OrderHistory) => cancelOrder(i.orderID)),
  );
};
