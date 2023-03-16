/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import { throttle } from 'lodash';

import { client } from './client';
import { Strategy } from './strategies';
import { Trade } from './types/Trade';
import BalanceFactory from './factory/BalanceFactory';
import { Mavelli } from './mavelli';
import { loadStrategies, onStrategyChange } from './spreadsheet/loadStrategies';
import { loadConfigs, onConfigChange } from './spreadsheet/loadConfigs';
import { getStrategyTable } from './utils/table';
import { savePositionsToGG } from './spreadsheet/savePositionsToGG';
import { SheetPosition } from './types/Position';

dotenv.config();

let AGG_STRATEGIES: Strategy[];
const BOT: Record<string, Mavelli> = {};

client.time().then((time) => {
  console.log('STARTED', time);
});

const onLastPrice = (trade: Trade) => {
  const symbol = trade.symbol;
  const price = trade.price;

  if (BOT[symbol]) {
    BOT[symbol].onLastPrice(price);
  }
};

const onOrderMatch = async (data: any) => {
  console.log(
    'R. ORDER UPDATE',
    data.symbol,
    data.orderStatus,
    data.quantity,
    data.price,
  );

  const symbol = data.symbol;
  const price = data.price;

  if (data.orderStatus === 'FILLED' && BOT[symbol]) {
    BOT[symbol].onOrderMatch(price);
  }

  if (data.orderStatus === 'CANCELED' && BOT[symbol]) {
    BOT[symbol].onCancel();
  }
};

const syncPositions = () => {
  const usdtPosition = {
    symbol: 'USDT',
    quantity: BalanceFactory.get('USDT'),
    avgPrice: 1,
    marketPrice: 1,
  };

  const positions: SheetPosition[] = Object.values(BOT)
    .map(
      (i) =>
        ({
          ...i.position,
          marketPrice: i.lastPrice,
          holdQuantity: i.strategy.holdQuantity,
        } as SheetPosition),
    )
    .filter((i) => i.quantity);
  const positionList = [usdtPosition, ...positions];

  console.log('POSITIONS');
  console.table(positionList);
  savePositionsToGG(positionList);
};

(async () => {
  AGG_STRATEGIES = await loadStrategies();
  console.table(AGG_STRATEGIES);
  AGG_STRATEGIES.forEach((i) => {
    BOT[i.symbol] = new Mavelli(i.symbol, i);
  });

  onConfigChange((data) => {
    BalanceFactory.setCashInventory(data.cashInventory);
  });

  onStrategyChange((list: Strategy[]) => {
    AGG_STRATEGIES = list;
    console.log('R. STRATEGY');
    console.table(getStrategyTable(AGG_STRATEGIES));

    AGG_STRATEGIES.forEach((i) => {
      const symbol = i.symbol;
      if (!symbol) return;

      if (BOT[symbol]) {
        BOT[symbol].setStrategy(i);
      } else {
        BOT[symbol] = new Mavelli(symbol, i);
      }
    });
  });

  await BalanceFactory.sync();

  client.ws.user(async (data) => {
    if (data.eventType === 'executionReport') {
      await BalanceFactory.sync();
      onOrderMatch(data);
    }

    if (data.eventType === 'balanceUpdate') {
      const asset = data.asset;
      const balance = parseFloat(data.balanceDelta);
      BalanceFactory.set(asset, BalanceFactory.get(asset) + balance);
      console.log('R. Balance Update', asset, BalanceFactory.get(asset));
    }
  });

  AGG_STRATEGIES.map(async (i: Strategy) => {
    const onTradeThrottle = throttle(onLastPrice, 2000);

    client.ws.trades(i.symbol, (data: any) => {
      const trade: Trade = {
        ...data,
        price: parseFloat(data.price),
        qty: parseFloat(data.quantity),
      };

      onTradeThrottle(trade);
    });
  });

  setInterval(() => {
    syncPositions();
  }, 120000);
})();
