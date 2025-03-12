const { UMFutures } = require('@binance/futures-connector');
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

const client = new UMFutures(BINANCE_API_KEY, BINANCE_API_SECRET, {
  baseURL: 'https://fapi.binance.com',
});

const showAccountInfo = async () => {
  try {
    const info = await client.getAccountConfig();
    console.log('client', info.data);
  } catch (err) {
    console.log('getAccountConfig Error:', err);
  }
};

showAccountInfo();

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
