import config from '../config';
import { OrderHistory } from '../types/Order';
import { getNumber } from '../utils/number';
import { cancelOrder, getLiveOrder, placeOrder } from './order';
import { getStockPosition } from './position';

export const placeBatchOrder = async (
  instrument: string,
  lastPrice: number,
) => {
  const positionList = await getStockPosition();
  const position = positionList.find((i) => i.instrumentID === instrument);

  if (!lastPrice) {
    throw new Error('Unable to get the current price');
  }

  return Promise.all([
    (async () => {
      const buyPrice = getNumber(
        (lastPrice * (100 - config.bot.buyLvPrc1)) / 100,
        2,
      );
      const qty =
        position && position.avgPrice > buyPrice
          ? config.bot.buyLvQty2
          : config.bot.buyLvQty1;

      return placeOrder(instrument, 'B', buyPrice, qty);
    })(),
    (async () => {
      const sellPrice = getNumber(
        (lastPrice * (100 + config.bot.sellLvPrc1)) / 100,
        2,
      );

      const qty =
        position && position.avgPrice < sellPrice
          ? config.bot.sellLvQty2
          : config.bot.sellLvQty1;

      if (position?.onHand || 0 < qty) {
        return;
      }

      return placeOrder(instrument, 'S', sellPrice, qty);
    })(),
  ]);
};

export const cancelAllOrder = async () => {
  const orders = await getLiveOrder();
  return Promise.all(orders.map((i: OrderHistory) => cancelOrder(i.orderID)));
};
