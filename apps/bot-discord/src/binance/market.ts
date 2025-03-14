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

  getExchangeInfo = async (symbol: string) => {
    const resp = await this.client.getExchangeInfo({ symbol });
    return resp.symbols.find((s) => s.symbol === symbol);
  };
}

export const binanceMarketData = new BinanceMarketData();
