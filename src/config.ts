import * as dotenv from 'dotenv';

dotenv.config();

export default {
  port: 3011,
  pinCode: '1we23rw4t',
  spotAccount: '1577921',
  market: {
    HubUrl: 'wss://fc-data.ssi.com.vn/v2.0/',
    ApiUrl: 'https://fc-data.ssi.com.vn/api/v2/Market/',
    ConsumerID: process.env.MARKET_CONSUMER_ID,
    ConsumerSecret: process.env.MARKET_CONSUMER_SECRET,
  },
  trading: {
    URL: 'https://fc-tradeapi.ssi.com.vn',
    stream_url: 'wss://fc-tradehub.ssi.com.vn/',
    ConsumerID: process.env.TRADING_CONSUMER_ID,
    ConsumerSecret: process.env.TRADING_CONSUMER_SECRET,
    PublicKey: process.env.TRADING_PUBLIC_KEY,
    PrivateKey: process.env.TRADING_PRIVATE_KEY,
  },
};
