import { fetchTrendingMemeTokenByTrades, TokenTrade } from './bitquery';
import {
  sendToLowCapDiscord,
  sendToMicroCapDiscord,
  sendToMidCapDiscord,
} from './discord';

const getDiscordMessage = (token: TokenTrade) => {
  return `
Token Info
- ${token.symbol} / ${token.name}
- volume: ${token.usd}
- mint address: ${token.mint_address}
- [gmgnai](https://gmgn.ai/sol/token/${token.mint_address}), [search token](https://x.com/search?q=${token.mint_address})
`;
};

export const main = async () => {
  const microCapTokens = fetchTrendingMemeTokenByTrades(
    20,
    0.0001,
    0.0005,
    30000,
    10,
  );
  (await microCapTokens).forEach(async (token) => {
    await sendToMicroCapDiscord(getDiscordMessage(token));
  });

  const lowCapTokens = fetchTrendingMemeTokenByTrades(
    20,
    0.0005,
    0.001,
    30000,
    10,
  );
  (await lowCapTokens).forEach(async (token) => {
    await sendToLowCapDiscord(getDiscordMessage(token));
  });

  const midCapTokens = fetchTrendingMemeTokenByTrades(
    20,
    0.001,
    0.005,
    30000,
    10,
  );
  (await midCapTokens).forEach(async (token) => {
    await sendToMidCapDiscord(getDiscordMessage(token));
  });
};
