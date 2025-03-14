import { PortfolioClient } from 'binance';
import { FutureOrderData } from './order';

export const placeBatchOrders = async (
  pmClient: PortfolioClient,
  ftOrderData: FutureOrderData,
): Promise<number> => {
  try {
    // place limit order
    const resp3 = await pmClient.submitNewUMOrder({
      symbol: ftOrderData.ticker,
      side: 'BUY',
      type: 'LIMIT',
      price: ftOrderData.price.toString(),
      quantity: ftOrderData.quantity.toString(),
      timeInForce: 'GTD',
      goodTillDate: new Date().getTime() + 1000 * 60 * 60, // 1 hour from now
      positionSide: 'LONG',
    });

    // place take profit and stop loss orders
    const resp4 = await pmClient.submitNewUMConditionalOrder({
      symbol: 'BTCUSDT',
      side: 'SELL',
      positionSide: 'LONG',
      strategyType: 'TAKE_PROFIT_MARKET',
      quantity: ftOrderData.quantity.toString(),
      stopPrice: ftOrderData.takeProfitPrice.toString(),
    });

    const resp5 = await pmClient.submitNewUMConditionalOrder({
      symbol: 'BTCUSDT',
      side: 'SELL',
      positionSide: 'LONG',
      strategyType: 'STOP_MARKET',
      quantity: ftOrderData.quantity.toString(),
      stopPrice: ftOrderData.stopLossPrice.toString(),
    });

    console.log('Result', resp3, resp4, resp5);

    return 0;
  } catch (error) {
    console.log('Error:', error);
    return -1;
  }
};
