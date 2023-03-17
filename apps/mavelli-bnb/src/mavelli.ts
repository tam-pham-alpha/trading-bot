import { client } from './client';
import { INTERVAL } from './config';
import BalanceFactory from './factory/BalanceFactory';
import { Strategy } from './strategies';
import { Position } from './types/Position';
import { getPosition } from './utils/getPosition';
import {
  getPriceByDelta,
  getValidNumber,
  matchExpectedPrice,
} from './utils/number';
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

    await this.cancelOrders();
    const order = await this.placeBuyOrder();

    if (this.interval) {
      clearInterval(this.interval);
    }

    if (order) {
      this.interval = setInterval(() => {
        this.start();
      }, INTERVAL.m60);
    }

    this.blocking = false;
  };

  onCancel = async () => {
    this.lastPrice = 0;
  };

  onOrderMatch = async (lastPrice: number) => {
    this.lastPrice = lastPrice;
    await this.getPosition();
  };

  onLastPrice = (lastPrice: number) => {
    const t = this.lastPrice;
    this.lastPrice = lastPrice;

    this.placeTpOrder();

    if (!t && this.lastPrice) {
      this.start();
    }
  };

  cancelOrders = async () => {
    if (!this.strategy.active) return;

    try {
      const orders = (await client.openOrders({ symbol: this.symbol })) || [];
      if (!orders.length) return 0;

      console.log('R. CANCEL OPEN ORDERS', this.symbol);
      for (let i = 0; i < orders.length; i++) {
        await client.cancelOrder({
          symbol: this.symbol,
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

    const quantity = getValidNumber(
      this.position.quantity - this.strategy.holdQuantity,
      this.strategy.lotSize,
    );

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
      !this.strategy.active ||
      !BalanceFactory.getIsActive() ||
      // already buy
      BalanceFactory.get(this.base) > 0
    ) {
      return;
    }

    const price = getPriceByDelta(
      this.lastPrice,
      this.strategy.buyPrice,
      this.strategy.tickSize,
    );
    const orderValue = price * this.strategy.buyQuantity;

    // wait for cancel event to trigger new orders
    if (orderValue >= BalanceFactory.get('USDT')) {
      return;
    }

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
