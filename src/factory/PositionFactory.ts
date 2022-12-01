import { orderBy } from 'lodash';
import { getStockPosition } from '../biz/position';
import { Strategy } from '../strategies';

import BalanceFactory from './BalanceFactory';
import { StockPosition } from '../types/Position';
import { roundByDp } from '../utils/number';

const MAX_ORDER = 8;

const normalizeStrategies = (
  positions: StockPosition[],
  strategies: Strategy[],
  totalBalance: number,
) => {
  return positions.map((i) => {
    const strategy = strategies.find((s) => s.symbol === i.instrumentID) || {
      allocation: 0,
    };
    const target = strategy.allocation;
    const allocation = roundByDp((i.value / totalBalance) * 100, 2);

    return {
      ...i,
      allocation,
      target,
      buying: allocation < target,
    };
  });
};

class PositionFactory {
  positions: StockPosition[] = [];
  strategies: Strategy[] = [];
  buyingList: string[] = [];

  setStrategies = (strategies: Strategy[]) => {
    this.strategies = strategies;
    this.positions = normalizeStrategies(
      this.positions,
      this.strategies,
      BalanceFactory.balance.totalAssets,
    );
    this.getBuyingList();
  };

  update = async () => {
    if (!this.strategies.length) return;

    const positions = await getStockPosition();
    this.positions = normalizeStrategies(
      positions,
      this.strategies,
      BalanceFactory.balance.totalAssets,
    );
    this.getBuyingList();
    return this.positions;
  };

  getBuyingList = () => {
    const symbols = orderBy(
      this.positions.filter((i) => i.buying),
      ['allocation'],
      ['asc'],
    )
      .slice(0, MAX_ORDER)
      .map((i) => i.instrumentID);

    this.buyingList = symbols;
    return this.buyingList;
  };

  checkIsBuyingStock = (symbol: string) => {
    return this.buyingList.join(', ').indexOf(symbol) >= 0;
  };

  getBySymbol = (symbol: string) => {
    return this.positions.find((i) => i.instrumentID === symbol);
  };
}

export default new PositionFactory();
