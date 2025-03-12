const { Spot } = require('@binance/connector');

type Order = {
  ticker: string;
  qty: number; // usd_qty
  ls: number;
  tp: number;
};

const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET || '';

const client = new Spot(BINANCE_API_KEY, BINANCE_API_SECRET);

export const placeOrder = async (): Promise<number> => {
  try {
    const response = await client.newOrder(
      'BTCUSDT', // Trading pair
      'BUY', // Order side (BUY or SELL)
      'MARKET', // Order type
      { quantity: 0.001 }, // Amount of BTC to buy
    );

    console.log('Market Order Response:', response.data);
    return 0;
  } catch (error) {
    console.log('Error:', error);
    return -1;
  }
};
