const { WebsocketAPI } = require('@binance/connector');

type Order = {
  ticker: string;
  qty: number; // usd_qty
  ls: number;
  tp: number;
};

const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';
const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET || '';

const client = new WebsocketAPI(BINANCE_API_KEY, BINANCE_API_SECRET);

// Subscribe to order updates
client.listenUserStream((data: any) => {
  console.log('User Data Stream Response:', data);
});

// Event listener for messages
client.on('message', (data: any) => {
  const response = JSON.parse(data);

  // Handle different event types
  if (response.e === 'executionReport') {
    console.log('Order Update:', response);
  }
});

// Error handling
client.on('error', (error: any) => {
  console.error('WebSocket Error:', error);
});

// Close connection properly when needed
process.on('SIGINT', () => {
  client.close();
  console.log('WebSocket closed');
  process.exit();
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
