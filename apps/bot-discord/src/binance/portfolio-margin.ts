import { PortfolioClient } from 'binance';
import { FutureOrderData } from './order';
import {
  NewPortfolioUMOrderReq,
  NewPortfolioUMConditionalOrderReq,
} from 'binance/lib/types/portfolio-margin';

export const getBatchOrders = (ftOrderData: FutureOrderData) => {
  // short position
  if (ftOrderData.side === 'SHORT') {
    return [
      {
        symbol: ftOrderData.ticker,
        side: 'SELL',
        positionSide: 'SHORT',
        type: 'MARKET',
        quantity: ftOrderData.quantity.toString(),
      },
      {
        symbol: 'BTCUSDT',
        side: 'BUY',
        positionSide: 'SHORT',
        strategyType: 'TAKE_PROFIT_MARKET',
        quantity: ftOrderData.quantity.toString(),
        stopPrice: ftOrderData.takeProfitPrice.toString(),
      },
      {
        symbol: 'BTCUSDT',
        side: 'BUY',
        positionSide: 'SHORT',
        strategyType: 'STOP_MARKET',
        quantity: ftOrderData.quantity.toString(),
        stopPrice: ftOrderData.stopLossPrice.toString(),
      },
    ];
  }

  // LONG position
  return [
    {
      symbol: ftOrderData.ticker,
      side: 'BUY',
      positionSide: 'LONG',
      type: 'MARKET',
      quantity: ftOrderData.quantity.toString(),
    },
    {
      symbol: 'BTCUSDT',
      side: 'SELL',
      positionSide: 'LONG',
      strategyType: 'TAKE_PROFIT_MARKET',
      quantity: ftOrderData.quantity.toString(),
      stopPrice: ftOrderData.takeProfitPrice.toString(),
    },
    {
      symbol: 'BTCUSDT',
      side: 'SELL',
      positionSide: 'LONG',
      strategyType: 'STOP_MARKET',
      quantity: ftOrderData.quantity.toString(),
      stopPrice: ftOrderData.stopLossPrice.toString(),
    },
  ];
};

export const placeBatchOrders = async (
  pmClient: PortfolioClient,
  ftOrderData: FutureOrderData,
): Promise<number> => {
  const orders = getBatchOrders(ftOrderData);

  try {
    await pmClient.submitNewUMOrder(orders[0] as NewPortfolioUMOrderReq);
    await pmClient.submitNewUMConditionalOrder(
      orders[1] as NewPortfolioUMConditionalOrderReq,
    );
    await pmClient.submitNewUMConditionalOrder(
      orders[2] as NewPortfolioUMConditionalOrderReq,
    );

    return 0;
  } catch (error) {
    console.log('Error:', error);
    return -1;
  }
};
