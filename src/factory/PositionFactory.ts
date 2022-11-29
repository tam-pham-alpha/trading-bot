import { getStockPosition } from '../biz/position';

import { StockPosition } from '../types/Position';

class PositionFactory {
  positions: StockPosition[] = [];

  update = async () => {
    this.positions = await getStockPosition();
    return this.positions;
  };

  getBySymbol = (symbol: string) => {
    return this.positions.find((i) => i.instrumentID === symbol);
  };
}

export default new PositionFactory();
