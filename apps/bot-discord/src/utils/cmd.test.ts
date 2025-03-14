import { parseTradeCommand, getCmdString, TradeCommand } from './cmd';

describe('parseTradeCommand', () => {
  test('should parse a valid trade command', () => {
    const message = '> long BTC 1000 1 1.5';
    const expected: TradeCommand = {
      side: 'LONG',
      ticker: 'BTCUSDT',
      qtyUsd: 1000,
      stopLoss: 1,
      takeProfit: 1.5,
    };

    const result = parseTradeCommand(message);
    expect(result).toEqual(expected);
  });

  test('should parse a valid trade command with USDT ticker', () => {
    const message = '> short ETHUSDT 500 2 3';
    const expected: TradeCommand = {
      side: 'SHORT',
      ticker: 'ETHUSDT',
      qtyUsd: 500,
      stopLoss: 2,
      takeProfit: 3,
    };

    const result = parseTradeCommand(message);
    expect(result).toEqual(expected);
  });

  test('should parse a valid trade command with USDC ticker', () => {
    const message = '> long LTCUSDC 200 1 2';
    const expected: TradeCommand = {
      side: 'LONG',
      ticker: 'LTCUSDC',
      qtyUsd: 200,
      stopLoss: 1,
      takeProfit: 2,
    };

    const result = parseTradeCommand(message);
    expect(result).toEqual(expected);
  });

  test('should handle missing ticker and append USDT', () => {
    const message = '> long LTC 200 1 2';
    const expected: TradeCommand = {
      side: 'LONG',
      ticker: 'LTCUSDT',
      qtyUsd: 200,
      stopLoss: 1,
      takeProfit: 2,
    };

    const result = parseTradeCommand(message);
    expect(result).toEqual(expected);
  });

  test('should handle invalid command format', () => {
    const message = '> invalid command';
    expect(parseTradeCommand(message)).toEqual(null);
  });
});

describe('getCmdString', () => {
  test('should generate a valid command string for LONG trade', () => {
    const cmd: TradeCommand = {
      side: 'LONG',
      ticker: 'BTCUSDT',
      qtyUsd: 1000,
      stopLoss: 1,
      takeProfit: 2.2,
    };

    const result = getCmdString(cmd);
    expect(result).toBe('Trade: LONG BTCUSDT 1000 1 2.2');
  });

  test('should generate a valid command string for SHORT trade', () => {
    const cmd: TradeCommand = {
      side: 'SHORT',
      ticker: 'ETHUSDT',
      qtyUsd: 500,
      stopLoss: 2,
      takeProfit: 3,
    };

    const result = getCmdString(cmd);
    expect(result).toBe('Trade: SHORT ETHUSDT 500 2 3');
  });

  test('should generate a valid command string with USDC ticker', () => {
    const cmd: TradeCommand = {
      side: 'LONG',
      ticker: 'LTCUSDC',
      qtyUsd: 200,
      stopLoss: 1,
      takeProfit: 2,
    };

    const result = getCmdString(cmd);
    expect(result).toBe('Trade: LONG LTCUSDC 200 1 2');
  });
});
