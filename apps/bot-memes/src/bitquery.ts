import axios, { AxiosRequestConfig } from 'axios';
import { sendToGeneralDiscord } from './discord';

const BIT_QUERY_API_KEY =
  'ory_at_l_e6JJHEbE0eFsWYqINs6prepCKRNuydK_6yfnt7WS0.9kLhXcoOmLZ9blDxDdOnRi62V_aF4fH9aTK4pJ8DJWo';

type GraphQLQuery = {
  query: string;
  variables: Record<string, any>;
};

export type TokenTrade = {
  symbol: string;
  name: string;
  mint_address: string;
  price_last: number;
  price_1h_ago: number;
  usd: number;
  buy: number;
  sell: number;
};

const displayTokenList = (list: TokenTrade[]): void => {
  list.forEach((item) => {
    console.log(item);
  });
};

const getTimeInMinutesAgo = (minutes: number): string => {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
};

const getTokenListByQuery = (
  time_ago: number,
  min_price: number,
  max_price: number,
  volume_1h_usd: number,
  limit: number,
): GraphQLQuery => {
  // describe the query
  // https://bitquery.io/docs/quick-start
  const query: GraphQLQuery = {
    query: `query ($time_ago: DateTime, $volume_1h_usd: String, $min_price: Float, $max_price: Float, $limit: Int) {
      Solana {
        DEXTradeByTokens(
          orderBy: {descendingByField: "buy"}
          where: {Trade: {Currency: {MintAddress: {notIn: ["So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]}}, Dex: {ProtocolFamily: {is: "Raydium"}}}, Transaction: {Result: {Success: true}}, Block: {Time: {after: $time_ago}}}
          limit: {count: $limit}
        ) {
          Trade {
            Currency {
              Symbol
              Name
              MintAddress
            }
            price_last: PriceInUSD(maximum: Block_Slot, selectWhere: {gt: $min_price, lt: $max_price})
            price_1h_ago: PriceInUSD(minimum: Block_Slot)
          }
          usd: sum(of: Trade_Side_AmountInUSD, selectWhere: {gt: $volume_1h_usd})
          buy: sum(of: Trade_Side_AmountInUSD, if: {Trade: {Side: {Type: {is: buy}}}})
          sell: sum(of: Trade_Side_AmountInUSD, if: {Trade: {Side: {Type: {is: sell}}}})
        }
      }
    }`,
    variables: {
      time_ago: getTimeInMinutesAgo(time_ago),
      min_price,
      max_price,
      volume_1h_usd: volume_1h_usd.toString(),
      limit,
    },
  };

  return query;
};

export const fetchTrendingMemeTokenByTrades = async (
  time_ago: number,
  min_price: number,
  max_price: number,
  volume_1h_usd: number,
  limit: number,
): Promise<TokenTrade[]> => {
  try {
    const query = getTokenListByQuery(
      time_ago,
      min_price,
      max_price,
      volume_1h_usd,
      limit,
    );
    const config: AxiosRequestConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://streaming.bitquery.io/eap',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${BIT_QUERY_API_KEY}`, // Replace with your actual token
      },
      data: JSON.stringify(query),
    };

    const response = await axios.request(config);
    const data: TokenTrade[] = response.data.data.Solana.DEXTradeByTokens.map(
      (i: any) =>
        ({
          symbol: i.Trade.Currency.Symbol,
          name: i.Trade.Currency.Name,
          mint_address: i.Trade.Currency.MintAddress,
          price_last: i.Trade.price_last,
          price_1h_ago: i.Trade.price_1h_ago,
          usd: Number(i.usd),
          buy: Number(i.buy),
          sell: Number(i.sell),
        } as TokenTrade),
    );
    return data;
  } catch (error) {
    sendToGeneralDiscord('fetchTrendingMemeTokenByTrades');
    sendToGeneralDiscord(`Error fetching data: ${JSON.stringify(error)}`);
    return [];
  }
};
