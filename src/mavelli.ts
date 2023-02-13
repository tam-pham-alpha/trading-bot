/* eslint-disable no-console */
import * as Sentry from '@sentry/node';

import { placeOrder } from './biz/order';
import BalanceFactory from './factory/BalanceFactory';
import OrderFactory, { LIVE_ORDER_STATUS } from './factory/OrderFactory';
import PositionFactory from './factory/PositionFactory';
import { INTERVAL, Strategy } from './strategies';
import { QuoteMessage, TradeMessage, TradingSession } from './types/Market';
import { OrderHistory, OrderMatchEvent, OrderUpdateEvent } from './types/Order';
import { getNumberByPercentage } from './utils/number';
import { checkCrossProfit } from './utils/number';

// The SSI auto trading bot
export class Mavelli {
  session: TradingSession = 'C';
  lastPrice: number;
  symbol: string;
  ready = false;
  isPlacingOrders = false;
  interval: NodeJS.Timer | undefined;
  timestamp = 0;
  strategy: Strategy;
  quote: QuoteMessage | undefined;
  trade: TradeMessage | undefined;
  orderId: string | undefined;

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

  setQuote = (quote: QuoteMessage) => {
    this.quote = quote;
  };

  setTrade = (trade: TradeMessage) => {
    this.trade = trade;
  };

  setStrategy = (strategy: Strategy) => {
    const old = this.strategy;
    this.strategy = strategy;

    if (
      old.buyPrc !== this.strategy.buyPrc ||
      old.buyQty1 !== this.strategy.buyQty1 ||
      old.buyQty2 !== this.strategy.buyQty2 ||
      old.tickSize !== this.strategy.tickSize ||
      old.interval !== this.strategy.interval ||
      !!this.orderId !== PositionFactory.checkIsBuyingStock(this.symbol)
    ) {
      this.startBuying();
    }
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
      if (
        this.orderId ||
        OrderFactory.getLiveOrdersBySymbol(this.symbol).length
      ) {
        console.log('A: CANCEL ALL ORDERS', this.symbol);
        await OrderFactory.cancelOrdersBySymbol(this.symbol);
        this.orderId = undefined;
      } else {
        order = await this.placeBuyOrder();
        if (!order) {
          Sentry.captureMessage('Mavelli: Unable to place order', {});
        }
      }
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
    if (
      !this.ready ||
      !this.strategy.active ||
      this.strategy.buyPrc > 0 ||
      !PositionFactory.checkIsBuyingStock(this.symbol)
    ) {
      return;
    }

    const positionList = PositionFactory.positions;
    const purchasingPower = BalanceFactory.getPurchasingPower();

    const position = positionList.find((i) => i.instrumentID === this.symbol);
    const strategy = this.strategy;
    const avgPrice = position?.avgPrice || 0;
    const allocation = position?.allocation || 0;

    if (!this.lastPrice) return;

    const buyPrice = Math.max(
      getNumberByPercentage(this.lastPrice, strategy.buyPrc, strategy.tickSize),
      this.trade?.Floor || 0,
    );

    // sometime buyQty2 is missing, hence it uses default config
    const qty =
      !avgPrice || avgPrice < buyPrice
        ? strategy.buyQty1
        : Math.max(strategy.buyQty1, strategy.buyQty2);

    // insufficient balance
    if (buyPrice * qty > purchasingPower) {
      console.log(`ERROR ${this.symbol}: insufficient balance`);
      return 0;
    }
    // don't buy more
    if (allocation >= strategy.allocation) {
      console.log(`ERROR ${this.symbol}: reached the allocation`);
      return 1;
    }

    console.log('R. PLACE ORDER', this.symbol, 'B', buyPrice, qty);
    return await placeOrder(this.symbol, 'B', buyPrice, qty);
  };

  placeTpOrder = async () => {
    if (this.strategy.takeProfit < 0) return;

    const strategy = this.strategy;
    const positionList = PositionFactory.positions;
    const position = positionList.find((i) => i.instrumentID === this.symbol);

    const avgPrice = position?.avgPrice ?? 0;
    const sellQty = position?.sellableQty ?? 0;

    if (
      !this.lastPrice ||
      !sellQty ||
      !strategy ||
      !checkCrossProfit(strategy.takeProfit, avgPrice, this.lastPrice)
    ) {
      return;
    }

    await placeOrder(this.symbol, 'S', this.lastPrice, sellQty);
  };

  onOrderUpdate = (data: OrderUpdateEvent) => {
    if (this.session !== 'LO') return;

    const order = data.data;

    // ignore old events
    const modifiedTime = order.modifiedTime;
    if (parseInt(modifiedTime) < this.timestamp) {
      return;
    }

    if (order.orderStatus === 'CL') {
      // if order is cancel by user start a new session
      this.startBuying();
    }

    if (LIVE_ORDER_STATUS.indexOf(order.orderStatus)) {
      this.orderId = order.orderID;
    }

    OrderFactory.orderUpdate([order as OrderHistory]);
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
