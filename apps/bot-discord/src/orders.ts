import { PortfolioClient } from 'binance';

const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET || '';

console.log('BINANCE_API_KEY', BINANCE_API_KEY);
console.log('BINANCE_API_SECRET', BINANCE_API_SECRET);

const pmClient = new PortfolioClient({
  api_key: BINANCE_API_KEY,
  api_secret: BINANCE_API_SECRET,
});

export const placeOrder = async (): Promise<number> => {
  try {
    const resp1 = await pmClient.testConnectivity();
    const resp2 = await pmClient.getAccountInfo();

    console.log('resp1', resp1);
    console.log('resp2', resp2);

    const quantity = '0.002';
    // const resp3 = await pmClient.submitNewUMOrder({
    //   symbol: 'BTCUSDT',
    //   side: 'BUY',
    //   type: 'LIMIT',
    //   price: '70000',
    //   quantity: quantity,
    //   timeInForce: 'GTD',
    //   goodTillDate: new Date().getTime() + 1000 * 60 * 60, // 1 hour from now
    //   positionSide: 'LONG',
    // });
    // console.log('resp3', resp3);

    const resp4 = await pmClient.submitNewUMConditionalOrder({
      symbol: 'BTCUSDT',
      side: 'SELL',
      positionSide: 'LONG',
      strategyType: 'TAKE_PROFIT_MARKET',
      quantity: quantity,
      stopPrice: '99000',
    });

    const resp5 = await pmClient.submitNewUMConditionalOrder({
      symbol: 'BTCUSDT',
      side: 'SELL',
      positionSide: 'LONG',
      strategyType: 'STOP_MARKET',
      quantity: quantity,
      stopPrice: '70000',
    });

    console.log('resp4', resp4);
    console.log('resp5', resp5);
    return 0;
  } catch (error) {
    console.log('Error:', error);
    return -1;
  }
};
