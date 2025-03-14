import { FuturesExchangeInfo, USDMClient } from 'binance';

class BinanceMarketData {
  client: USDMClient;

  constructor() {
    this.client = new USDMClient({});
  }

  getAvgPrice = async (symbol: string): Promise<number> => {
    const resp = await this.client.getMarkPrice({ symbol });
    return Number(resp.markPrice);
  };

  getExchangeInfo = async (symbol: string) => {
    const resp: FuturesExchangeInfo = await this.client.getExchangeInfo();
    return resp.symbols.find((s) => s.symbol === symbol);
  };
}

export const binanceMarketData = new BinanceMarketData();
