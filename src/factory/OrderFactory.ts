import { orderBy, uniqBy } from 'lodash';

import { cancelOrder, getLiveOrder } from '../biz/order';
import { OrderHistory } from '../types/Order';
import { wait } from '../utils/time';
import PositionFactory from './PositionFactory';

export const LIVE_ORDER_STATUS = ['WA', 'RS', 'SD', 'QU', 'PF'];

class OrderFactory {
  orders: OrderHistory[];
  ordersToCancel: string[] = [];

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

  cancelOrdersByIds = async (orderIds: string[]) => {
    for (let i = 0; i < orderIds.length; i++) {
      await cancelOrder(orderIds[i]);
      await wait(1000);
    }
  };

  cancelAllOrders = async () => {
    const orders = this.getLiveOrders();
    await this.cancelOrdersByIds(orders.map((i) => i.orderID));
    return [];
  };

  orderCheck = async () => {
    await this.update();
    const liveOrders = orderBy(this.getLiveOrders(), ['modifiedTime'], 'asc');
    const buyingTokens = PositionFactory.getBuyingList();

    for (let i = 0; i < buyingTokens.length; i++) {
      const list = liveOrders.filter((o) => o.instrumentID === buyingTokens[i]);
      if (list.length > 1) {
        await this.cancelOrdersByIds(list.map((j) => j.orderID).slice(1));
      }
    }

    await wait(1000);
  };
}

export default new OrderFactory();
