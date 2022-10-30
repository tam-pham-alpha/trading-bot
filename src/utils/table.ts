import { OrderHistory } from '../types/Order';

export const getOrderTable = (orders: OrderHistory[]) => {
  return orders.map((i) => ({
    instrument: i.instrumentID,
    orderID: i.orderID,
    side: i.buySell,
    quantity: i.quantity,
    filledQty: i.filledQty,
    orderStatus: i.orderStatus,
    timestamp: i.inputTime,
    orderType: i.orderType,
  }));
};
