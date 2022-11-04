import { strategies } from '../config';
import { Account } from '../types/Account';
import { OrderHistory } from '../types/Order';
import { StockPosition } from '../types/Position';
import { orderBy } from 'lodash';

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
    orderType: i.orderType,
    timestamp: i.inputTime,
  }));
};

export const getAccountTable = (accounts: Account[]) => {
  return accounts.map((i) => ({
    account: i.account,
    totalAssets: i.totalAssets,
    purchasingPower: i.purchasingPower,
    withdrawable: i.withdrawable,
    receivingCashT1: i.receivingCashT1,
    receivingCashT2: i.receivingCashT2,
    secureAmount: i.secureAmount,
    cashBal: i.cashBal,
  }));
};

export const getStockPositionTable = (positions: StockPosition[]) => {
  const list = positions.map((i) => ({
    symbol: i.instrumentID,
    sellableQty: i.sellableQty,
    avgPrice: i.avgPrice,
    marketPrice: i.marketPrice,
    buyT0: i.buyT0,
    buyT1: i.buyT1,
    buyT2: i.buyT2,
    total: i.total,
    value: i.value,
    allocation: i.allocation,
    target: strategies.find((s) => s.symbol === i.instrumentID)?.allocation,
  }));
  return orderBy(list, ['value'], ['desc']);
};
