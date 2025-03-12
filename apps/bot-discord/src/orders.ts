const { WebsocketAPI } = require('@binance/connector');

type Order = {
  ticker: string;
  qty: number; // usd_qty
  ls: number;
  tp: number;
};

const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET || '';

console.log('BINANCE_API_KEY', BINANCE_API_KEY);
console.log('BINANCE_API_SECRET', BINANCE_API_SECRET);

const callbacks = {
  open: (client: any) => {
    console.log('Connected with Websocket server');
  },
  close: () => console.log('Disconnected with Websocket server'),
  message: (data: any) => console.log('socket message', data),
};

const client = new WebsocketAPI(BINANCE_API_KEY, BINANCE_API_SECRET, {
  callbacks,
});

export const placeOrder = async (): Promise<number> => {
  try {
    const response = await client.newOrder(
      'BTCUSDT', // Trading pair
      'BUY', // Order side (BUY or SELL)
      'MARKET', // Order type
      { quantity: 0.001 }, // Amount of BTC to buy
    );

    console.log('Market Order Response:', response);
    return 0;
  } catch (error) {
    console.log('Error:', error);
    return -1;
  }
};
