import { getStockPosition } from '../biz/position';

import { StockPosition } from '../types/Position';

class PositionFactory {
  positions: StockPosition[] = [];

  update = async () => {
    this.positions = await getStockPosition();
    return this.positions;
  };
}

export default new PositionFactory();
