export type TradeCommand = {
  side: 'LONG' | 'SHORT';
  ticker: string;
  qtyUsd: number;
  stopLoss: number;
  takeProfit: number;
};

export const parseTradeCommand = (message: string): TradeCommand | null => {
  const cmd = message.substring(message.indexOf('>') + 1).trim();
  if (cmd.split(' ').length !== 5) return null;

  const [_side, _ticker, qtyUsd, stopLoss, takeProfit] = cmd.split(' ');
  const ticker =
    _ticker.includes('USDT') || _ticker.includes('USDC')
      ? _ticker
      : `${_ticker}USDT`.toUpperCase();

  const side = _side.toUpperCase();
  if (side !== 'LONG' && side !== 'SHORT') return null;

  return {
    side,
    ticker,
    qtyUsd: Number(qtyUsd),
    stopLoss: Number(stopLoss),
    takeProfit: Number(takeProfit),
  };
};

export const getCmdString = (cmd: TradeCommand): string => {
  return `Trade: ${cmd.side} ${cmd.ticker} ${cmd.qtyUsd} ${cmd.stopLoss} ${cmd.takeProfit}`;
};
