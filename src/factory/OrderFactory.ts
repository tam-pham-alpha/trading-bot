import { uniqBy } from 'lodash';

import { cancelOrder, getLiveOrder } from '../biz/order';
import { OrderHistory } from '../types/Order';
import { wait } from '../utils/time';

export const LIVE_ORDER_STATUS = ['WA', 'RS', 'SD', 'QU', 'PF'];

class OrderFactory {
  orders: OrderHistory[];

  constructor() {
    this.orders = [];
  }

  update = async () => {
    const liveOrders = await getLiveOrder();
    this.orders = liveOrders;
    return this.orders;
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

  cancelOrderById = async (orderId: string) => {
    await cancelOrder(orderId);
    await wait(1000);
    return true;
  };

  cancelOrdersBySymbol = async (symbol: string) => {
    const orders = this.getLiveOrdersBySymbol(symbol).filter(
      (i) => i.buySell === 'B',
    );

    for (let i = 0; i < orders.length; i++) {
      const item = orders[i];
      await cancelOrder(item.orderID);
      await wait(1000);
    }

    this.orders = this.orders.filter((i) => i.instrumentID !== symbol);
    return orders;
  };

  cancelAllOrders = async () => {
    const orders = this.getLiveOrders();

    for (let i = 0; i < orders.length; i++) {
      const item = orders[i];
      await cancelOrder(item.orderID);
      await wait(1000);
    }

    return [];
  };
}

export default new OrderFactory();
