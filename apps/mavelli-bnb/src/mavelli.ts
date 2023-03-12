import { client } from './client';
import { INTERVAL } from './config';
import BalanceFactory from './factory/BalanceFactory';
import { Strategy } from './strategies';
import { Position } from './types/Position';
import { getPosition } from './utils/getPosition';
import { getPriceByDelta, matchExpectedPrice } from './utils/number';
import { getAssetBySymbol } from './utils/symbol';

const BOT_PREFIX = 'mavelli';
const SYNC_POSITION_INTERVAL = 300000; // 5 mins

export class Mavelli {
  symbol: string;
  base: string;
  quote: string;
  strategy: Strategy;
  lastPrice = 0;
  position: Position | undefined;
  interval: NodeJS.Timer | undefined;
  blocking = false;

  constructor(symbol: string, strategy: Strategy) {
    this.symbol = symbol;
    this.strategy = strategy;
    this.base = getAssetBySymbol(symbol);
    this.quote = 'USDT';
    this.init();
  }

  setStrategy = async (strategy: Strategy) => {
    this.strategy = strategy;
    await this.getPosition();
    this.start();
  };

  getPosition = async () => {
    if (!BalanceFactory.get(this.base)) {
      this.position = {
        symbol: this.symbol,
        quantity: 0,
        avgPrice: 0,
        takeProfit: 0,
        tpPrice: 0,
        expectedPnl: 0,
        valid: true,
      };
      return;
    }

    this.position = await getPosition(this.symbol, this.strategy);
    console.table([this.position]);
  };

  init = async () => {
    await this.getPosition();

    setInterval(() => {
      this.getPosition();
    }, SYNC_POSITION_INTERVAL);
    this.start();
  };

  start = async () => {
    if (this.blocking) return;

    this.blocking = true;
    await this.placeBuyOrder();

    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      this.start();
    }, INTERVAL.m60);

    this.blocking = false;
  };

  onCancel = async () => {
    this.lastPrice = 0;
    this.start();
  };

  onOrderMatch = async (lastPrice: number) => {
    this.lastPrice = lastPrice;
    await this.getPosition();
    this.start();
  };

  onLastPrice = (lastPrice: number) => {
    const t = this.lastPrice;
    this.lastPrice = lastPrice;

    this.placeTpOrder();

    if (!t && this.lastPrice) {
      this.start();
    }
  };

  cancelOrders = async (symbol: string) => {
    try {
      const orders = (await client.openOrders({ symbol })) || [];
      if (!orders.length) return 0;

      console.log('R. CANCEL OPEN ORDERS', this.symbol);
      for (let i = 0; i < orders.length; i++) {
        await client.cancelOrder({
          symbol,
          orderId: orders[i].orderId,
        });
      }

      return 0;
    } catch (err) {
      console.log('cancelOrders:ERR', err);
      return 0;
    }
  };

  placeTpOrder = async () => {
    if (!this.position || !this.lastPrice || !this.position.quantity) return;

    const quantity = this.position.quantity - this.strategy.holdQuantity;

    if (
      this.position.valid &&
      quantity > 0 &&
      matchExpectedPrice(
        this.lastPrice,
        this.position.avgPrice,
        this.strategy.takeProfit,
        this.strategy.tickSize,
      )
    ) {
      this.position.valid = false;
      const order = {
        symbol: this.symbol,
        side: 'SELL',
        type: 'LIMIT',
        quantity: quantity,
        price: this.lastPrice,
        newClientOrderId: `${BOT_PREFIX}-${Date.now()}`,
      };

      console.log(
        'R. PLACE TAKE PROFIT ORDER',
        this.lastPrice,
        this.position.avgPrice,
        this.strategy.takeProfit,
        order.quantity,
      );

      try {
        // @ts-ignore
        await client.order(order);
      } catch (err) {
        console.log('placeTpOrder:ERR', err);
      }
    }
  };

  placeBuyOrder = async () => {
    if (
      !this.position ||
      !this.lastPrice ||
      BalanceFactory.get(this.base) > 0
    ) {
      return;
    }

    await this.cancelOrders(this.symbol);

    const price = getPriceByDelta(
      this.lastPrice,
      this.strategy.buyPrice,
      this.strategy.tickSize,
    );
    const orderValue = price * this.strategy.buyQuantity;

    // wait for cancel event to trigger new orders
    if (!this.strategy.active || orderValue >= BalanceFactory.get('USDT'))
      return;

    const order = {
      symbol: this.symbol,
      side: 'BUY',
      type: 'LIMIT',
      quantity: this.strategy.buyQuantity,
      price,
      newClientOrderId: `${BOT_PREFIX}-${Date.now()}`,
    };

    console.log('R. PLACE ORDER', this.symbol, order.quantity, order.price);
    try {
      // @ts-ignore
      return await client.order(order);
    } catch (err) {
      console.log('placeBuyOrder:ERR', err);
    }
  };
}
