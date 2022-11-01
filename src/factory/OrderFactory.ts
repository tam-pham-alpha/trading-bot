import { uniqBy } from 'lodash';

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
}

export default new OrderFactory();
