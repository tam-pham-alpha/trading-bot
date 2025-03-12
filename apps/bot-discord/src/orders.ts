const { CMFutures } = require('@binance/futures-connector');
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

const client = new CMFutures(BINANCE_API_KEY, BINANCE_API_SECRET, {
  baseURL: 'https://dapi.binance.com',
});

const showAccountInfo = async () => {
  try {
    const info = await client.getAccountInformation({ recvWindow: 2000 });
    console.log('client', info);
  } catch (err) {
    console.log('showAccountInfo Error:', err);
  }
};

showAccountInfo();

export const placeOrder = async (): Promise<number> => {
  try {
    await client.setLeverage({
      symbol: 'BTCUSDT',
      leverage: 20,
    });
    const response = await client.newOrder(
      'BTCUSDT_PERP', // Trading pair
      'BUY', // Order side (BUY or SELL)
      'MARKET', // Order type
      { quoteOrderQty: 100 }, // Amount of BTC to buy
    );

    console.log('Market Order Response:', response);
    return 0;
  } catch (error) {
    console.log('Error:', error);
    return -1;
  }
};
