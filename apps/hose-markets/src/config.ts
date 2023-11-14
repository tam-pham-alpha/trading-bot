import * as dotenv from 'dotenv';

dotenv.config();

export default {
  market: {
    HubUrl: 'wss://fc-datahub.ssi.com.vn/',
    ApiUrl: 'https://fc-data.ssi.com.vn/api/v2/Market/',
    ConsumerID: process.env.MARKET_CONSUMER_ID,
    ConsumerSecret: process.env.MARKET_CONSUMER_SECRET,
  },
};
