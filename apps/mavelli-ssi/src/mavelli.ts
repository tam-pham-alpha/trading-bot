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
import { NewOrder } from './types/Order';

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
  orderID: string | undefined;
  requestID: string | undefined;
  isLiveOrder = false;

  constructor(symbol: string, strategy: Strategy) {
    this.symbol = symbol;
    this.lastPrice = 0;
    this.strategy = strategy;

    if (this.strategy && PositionFactory.checkIsBuyingStock(this.symbol)) {
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
      old.buyPrice !== this.strategy.buyPrice ||
      old.buyQuantity !== this.strategy.buyQuantity ||
      old.buyQuantity !== this.strategy.buyQuantity ||
      old.tickSize !== this.strategy.tickSize ||
      old.interval !== this.strategy.interval
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
    if (
      (!t || !this.isLiveOrder) &&
      PositionFactory.checkIsBuyingStock(this.symbol)
    ) {
      this.startBuying();
    }
  };

  startBuying = async () => {
    if (
      this.isPlacingOrders ||
      this.strategy.buyPrice > 0 ||
      this.session !== 'LO' ||
      !this.ready ||
      !this.strategy.active ||
      !this.lastPrice ||
      !PositionFactory.checkIsBuyingStock(this.symbol)
    ) {
      return;
    }

    console.log('startBuying B', this.symbol, this.lastPrice);
    this.isPlacingOrders = true;
    this.timestamp = Date.now();

    let order;

    // cancel existing orders if any
    if (OrderFactory.getLiveOrdersBySymbol(this.symbol).length) {
      console.log('A: CANCEL ALL ORDERS', this.symbol);
      await OrderFactory.cancelOrdersBySymbol(this.symbol);
      this.orderID = undefined;
      this.requestID = undefined;
      this.isLiveOrder = false;
    } else {
      order = await this.placeBuyOrder();
      if (typeof order !== 'number' && order?.requestID) {
        this.requestID = order.requestID;
      }
      if (typeof order !== 'number') {
        console.log('Start Buying: ORDER', order);
      }
      if (!order) {
        Sentry.captureMessage('Mavelli: Unable to place order', {});
      }
    }

    if (this.interval) {
      clearInterval(this.interval);
    }

    if (order) {
      this.isLiveOrder = true;
      this.interval = setInterval(() => {
        if (!PositionFactory.checkIsBuyingStock(this.symbol)) {
          clearInterval(this.interval);
          return;
        }
        this.startBuying();
      }, this.strategy?.interval || INTERVAL.m30);
    }

    this.isPlacingOrders = false;
  };

  placeBuyOrder = async (): Promise<NewOrder | number> => {
    console.log(
      'Place Buy Order',
      this.symbol,
      PositionFactory.checkIsBuyingStock(this.symbol),
    );
    if (
      this.strategy.buyPrice > 0 ||
      !this.ready ||
      !this.strategy.active ||
      !this.lastPrice ||
      !PositionFactory.checkIsBuyingStock(this.symbol)
    ) {
      return 0;
    }

    const positionList = PositionFactory.positions;
    const purchasingPower = BalanceFactory.getPurchasingPower();

    const position = positionList.find((i) => i.instrumentID === this.symbol);
    const strategy = this.strategy;
    const allocation = position?.allocation || 0;

    const buyPrice = Math.max(
      getNumberByPercentage(
        this.lastPrice,
        strategy.buyPrice,
        strategy.tickSize,
      ),
      this.trade?.Floor || 0,
    );

    // sometime buyQty2 is missing, hence it uses default config
    const qty = strategy.buyQuantity;

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
    const sellQty = Math.min(
      position?.sellableQty ?? 0,
      (position?.total ?? 0) - strategy.holdQuantity,
    );

    if (
      !this.lastPrice ||
      !sellQty ||
      !strategy ||
      !checkCrossProfit(strategy.takeProfit, avgPrice, this.lastPrice) ||
      sellQty < 0
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

    if (
      LIVE_ORDER_STATUS.indexOf(order.orderStatus) &&
      order.origRequestID === this.requestID
    ) {
      console.log('onOrderUpdate: set orderID', order.orderID);
      this.orderID = order.orderID;
    }

    if (order.orderStatus === 'CL' && order.orderID === this.orderID) {
      // if order is cancel by user start a new session
      this.startBuying();
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
