import { MainClient } from 'binance';

class BinanceMarketData {
  client: MainClient;

  constructor() {
    this.client = new MainClient({});
  }

  getAvgPrice = async (symbol: string): Promise<number> => {
    const resp = await this.client.getAvgPrice({ symbol });
    return Number(resp.price);
  };
}

export const binanceMarketData = new BinanceMarketData();
