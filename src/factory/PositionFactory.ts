import { orderBy } from 'lodash';
import { getStockPosition } from '../biz/position';
import { Strategy } from '../strategies';

import BalanceFactory from './BalanceFactory';
import { StockPosition } from '../types/Position';
import { roundByDp } from '../utils/number';
import { MAX_ORDER } from '../consts';

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
  maxOrder = MAX_ORDER;

  update = async () => {
    if (!this.strategies.length) return;

    const positions = await getStockPosition();
    this.positions = normalizeStrategies(
      positions,
      this.strategies,
      BalanceFactory.getTotalAsset(),
    );
    this.getBuyingList();
    return this.positions;
  };

  setMaxOrder = (max: number) => {
    this.maxOrder = max;
    this.getBuyingList();
  };

  setStrategies = (strategies: Strategy[]) => {
    this.strategies = strategies;
    this.positions = normalizeStrategies(
      this.positions,
      this.strategies,
      BalanceFactory.getTotalAsset(),
    );
    this.getBuyingList();
  };

  getBuyingList = () => {
    const symbols = orderBy(
      this.positions.filter((i) => i.buying),
      ['allocation'],
      ['asc'],
    )
      .slice(0, this.maxOrder)
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
