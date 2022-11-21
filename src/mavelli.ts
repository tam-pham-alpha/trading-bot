/* eslint-disable no-console */
import { placeOrder } from './biz/order';
import BalanceFactory from './factory/BalanceFactory';
import OrderFactory from './factory/OrderFactory';
import PositionFactory from './factory/PositionFactory';
import { INTERVAL, Strategy } from './strategies';
import { TradingSession } from './types/Market';
import { OrderMatchEvent, OrderUpdateEvent } from './types/Order';
import { getNumberByPercentage } from './utils/number';
import { wait } from './utils/time';
import { checkCrossProfit } from './utils/number';

const SERVER_IP = '13.215.51.234';

// The SSI auto trading bot
export class Mavelli {
  session: TradingSession = 'C';
  strategy: Strategy;
  lastPrice: number;
  symbol: string;
  ready = false;
  isPlacingOrders = false;
  interval: NodeJS.Timer | undefined;
  timestamp = 0;

  constructor(symbol: string, strategy: Strategy) {
    this.symbol = symbol;
    this.lastPrice = 0;
    this.strategy = strategy;

    if (this.strategy) {
      this.startBuying();
    }
  }

  setReady = () => {
    this.ready = true;
  };

  setSession = (session: TradingSession) => {
    this.session = session;
  };

  setLastPrice = (lastPrice: number) => {
    const t = this.lastPrice;
    this.lastPrice = lastPrice;

    if (this.lastPrice) {
      this.placeTpOrder();
    }

    // start when the price comes
    if (!t && this.lastPrice) {
      this.startBuying();
    }
  };

  startBuying = async () => {
    if (this.isPlacingOrders) return;
    this.isPlacingOrders = true;
    this.timestamp = Date.now();

    let order;
    if (this.session === 'LO' && this.lastPrice) {
      // cancel existing orders if any
      if (OrderFactory.getLiveOrdersBySymbol(this.symbol).length) {
        console.log('A: CANCEL ALL ORDERS', this.symbol);

        await OrderFactory.cancelOrdersBySymbol(this.symbol);
        await wait(5000);

        await BalanceFactory.update();
        await wait(5000);
      }

      console.log('A: PLACE ORDERS', this.lastPrice);
      order = await this.placeBuyOrder();
    }

    if (this.interval) {
      clearInterval(this.interval);
    }

    if (order) {
      this.interval = setInterval(() => {
        this.startBuying();
      }, this.strategy?.interval || INTERVAL.m30);
    } else {
      // waiting for the new trade to trigger this again
      this.lastPrice = 0;
    }

    this.isPlacingOrders = false;
  };

  placeBuyOrder = async () => {
    if (!this.ready) return;

    const positionList = PositionFactory.positions;
    const balance = BalanceFactory.balance;

    const position = positionList.find((i) => i.instrumentID === this.symbol);
    const strategy = this.strategy;
    const avgPrice = position?.avgPrice || 0;
    const allocation = position?.allocation || 0;

    if (!this.lastPrice) return;

    const buyPrice = getNumberByPercentage(
      this.lastPrice,
      strategy.buyLvPrc1,
      2,
    );
    const qty =
      !avgPrice || avgPrice < buyPrice
        ? strategy.buyLvQty1
        : strategy.buyLvQty2;

    // insufficient balance
    if (buyPrice * qty > balance.purchasingPower) {
      console.log(`ERROR ${this.symbol}: insufficient balance`);
      return 0;
    }
    // don't buy more
    if (allocation >= strategy.allocation) {
      console.log(`ERROR ${this.symbol}: reached the allocation`);
      return 1;
    }

    await placeOrder(this.symbol, 'B', buyPrice, qty);
    return 1;
  };

  placeTpOrder = async () => {
    const strategy = this.strategy;
    const positionList = PositionFactory.positions;
    const position = positionList.find((i) => i.instrumentID === this.symbol);

    const avgPrice = position?.avgPrice || 0;
    const sellQty = position?.sellableQty || 0;

    if (
      !this.lastPrice ||
      !sellQty ||
      !strategy ||
      !checkCrossProfit(strategy.takeProfit, avgPrice, this.lastPrice)
    ) {
      return;
    }

    return await placeOrder(this.symbol, 'S', this.lastPrice, sellQty);
  };

  onOrderUpdate = (data: OrderUpdateEvent) => {
    if (this.session !== 'LO') return;

    const order = data.data;

    // ignore old events
    const modifiedTime = order.modifiedTime;
    if (parseInt(modifiedTime) < this.timestamp) {
      return;
    }

    // if order is cancel by user start a new session
    if (order.orderStatus === 'CL' && order.ipAddress !== SERVER_IP) {
      this.startBuying();
    }
  };

  onOrderMatch = (data: OrderMatchEvent) => {
    if (this.session !== 'LO') return;

    // ignore old events
    const matchTime = data.data.matchTime;
    if (parseInt(matchTime) < this.timestamp) {
      return;
    }

    this.lastPrice = data.data.matchPrice;

    this.startBuying();
  };
}
