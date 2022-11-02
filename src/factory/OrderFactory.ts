import { uniqBy } from 'lodash';
import { cancelOrder } from '../biz/order';

import { OrderHistory } from '../types/Order';

class OrderFactory {
  orders: OrderHistory[];

  constructor() {
    this.orders = [];
  }

  setOrders = (newOrders: OrderHistory[]) => {
    this.orders = newOrders;
  };

  orderUpdate = (newOrders: OrderHistory[]) => {
    this.orders = uniqBy(
      [...newOrders, ...this.orders],
      (i: OrderHistory) => i.orderID,
    );
  };

  getOrders = () => {
    return this.orders;
  };

  getLiveOrders = () => {
    return this.orders.filter(
      (i) =>
        i.orderStatus === 'WA' ||
        i.orderStatus === 'RS' ||
        i.orderStatus === 'SD' ||
        i.orderStatus === 'QU' ||
        i.orderStatus === 'PF',
    );
  };

  cancelOrdersBySymbol = async (symbol: string) => {
    const orders = this.getLiveOrders().filter(
      (i) => i.instrumentID === symbol,
    );

    return Promise.all(orders.map((i: OrderHistory) => cancelOrder(i.orderID)));
  };
}

export default new OrderFactory();
