import { uniqBy } from 'lodash';

import { cancelOrder, getLiveOrder } from '../biz/order';
import { OrderHistory } from '../types/Order';

class OrderFactory {
  orders: OrderHistory[];

  constructor() {
    this.orders = [];
  }

  update = async () => {
    const liveOrders = await getLiveOrder();
    this.orders = liveOrders;
  };

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

  getLiveOrdersBySymbol = (symbol: string) => {
    return this.getLiveOrders().filter((i) => i.instrumentID === symbol);
  };

  cancelOrdersBySymbol = async (symbol: string) => {
    const orders = this.getLiveOrdersBySymbol(symbol).filter(
      (i) => i.buySell === 'B',
    );
    await Promise.all(orders.map((i: OrderHistory) => cancelOrder(i.orderID)));
    this.orders = this.orders.filter((i) => i.instrumentID !== symbol);
    return orders;
  };

  cancelAllOrders = async () => {
    const orders = this.getLiveOrders();
    return Promise.all(orders.map((i: OrderHistory) => cancelOrder(i.orderID)));
  };
}

export default new OrderFactory();
