import { Account } from '../types/Account';
import { OrderHistory } from '../types/Order';
import { StockPosition } from '../types/Position';

export const getOrderTable = (orders: OrderHistory[]) => {
  return orders.map((i) => ({
    instrument: i.instrumentID,
    orderID: i.orderID,
    side: i.buySell,
    price: i.price,
    quantity: i.quantity,
    filledQty: i.filledQty,
    avgPrice: i.avgPrice,
    orderStatus: i.orderStatus,
    timestamp: i.inputTime,
    orderType: i.orderType,
  }));
};

export const getAccountTable = (accounts: Account[]) => {
  return accounts.map((i) => ({
    account: i.account,
    totalAssets: i.totalAssets,
    cashBal: i.cashBal,
    secureAmount: i.secureAmount,
    withdrawable: i.withdrawable,
    receivingCashT1: i.receivingCashT1,
    receivingCashT2: i.receivingCashT2,
  }));
};

export const getStockPositionTable = (positions: StockPosition[]) => {
  return positions.map((i) => ({
    symbol: i.instrumentID,
    onHand: i.onHand,
    avgPrice: i.avgPrice,
    marketPrice: i.marketPrice,
    buyT0: i.buyT0,
    buyT1: i.buyT1,
    buyT2: i.buyT2,
    sellT0: i.sellT0,
    sellT1: i.sellT1,
    sellT2: i.sellT2,
  }));
};
