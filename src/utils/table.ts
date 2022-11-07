import { strategies, Strategy } from '../config';
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
  const list = positions.map((i) => {
    const target =
      strategies.find((s) => s.symbol === i.instrumentID)?.allocation || 0;
    const pnl = i.marketPrice
      ? Math.round(((i.avgPrice - i.marketPrice) / i.marketPrice) * 10000) / 100
      : 0;

    return {
      symbol: i.instrumentID,
      avgPrice: i.avgPrice,
      marketPrice: i.marketPrice,
      pnl,
      sellableQty: i.sellableQty,
      buyT0: i.buyT0,
      buyT1: i.buyT1,
      buyT2: i.buyT2,
      total: i.total,
      value: i.value,
      allocation: i.allocation,
      target,
      buying: (i.allocation || 0) <= target,
    };
  });

  return orderBy(list, ['allocation', 'target'], ['desc', 'desc']);
};

export const getStrategyTable = (strategies: Strategy[]) => {
  return orderBy(strategies, ['allocation', 'buyLvPrc1'], ['desc', 'asc']);
};
