import Binance from 'node-binance-api';

const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET || '';

console.log('BINANCE_API_KEY', BINANCE_API_KEY);
console.log('BINANCE_API_SECRET', BINANCE_API_SECRET);

const client = Binance({
  apiKey: BINANCE_API_KEY,
  apiSecret: BINANCE_API_SECRET,
  getTime: () => Date.now(),
});

export const placeOrder = async (): Promise<number> => {
  try {
    const batchOrders = [
      {
        symbol: 'BNBUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: '0.1',
      },
      {
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        quantity: '0.001',
      },
    ];

    const response = await client.placeMultipleOrders(
      JSON.stringify(batchOrders),
    );

    // const response = await client.newOrder(
    //   'BNBUSDT', // Trading pair
    //   'BUY', // Order side (BUY or SELL)
    //   'MARKET', // Order type
    //   {
    //     quantity: 20,
    //   },
    // );

    console.log('Market Order Response:', response.data);
    return 0;
  } catch (error) {
    console.log('Error:', error);
    return -1;
  }
};
