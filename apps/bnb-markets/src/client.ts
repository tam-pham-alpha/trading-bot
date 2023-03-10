import * as dotenv from 'dotenv';
import Binance from 'binance-api-node';

dotenv.config();

console.log('process.env.API_KEY', process.env.API_KEY);

export const client = Binance({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  getTime: () => Date.now(),
});
