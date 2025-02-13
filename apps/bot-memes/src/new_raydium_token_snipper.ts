import { callAuthAPI } from './autosniper';
import { sendDiscordMessage } from './discord';
import {
  getSocialImpactOfContractAddress,
  SocialImpact,
} from './twitter-check';

// create a beautiful message for discord
const getDiscordMessage = (
  contractAddress: string,
  socialImpact: SocialImpact,
) => {
  return `
Token Address: ${contractAddress}
Gmgnai: [${contractAddress}](https://gmgn.ai/sol/token/${contractAddress}) 
Social Impact:
- Total Followers: ${socialImpact.total_followers_count}
- Total Favorites: ${socialImpact.total_favorite_count}
- Total Retweets: ${socialImpact.total_retweet_count}
- Total Posts: ${socialImpact.total_posts_count}
`;
};
// - Total Friends: ${socialImpact.total_friends_count}
// - Total Replies: ${socialImpact.total_reply_count}
// - Total Quotes: ${socialImpact.total_quote_count}
// - Total Views: ${socialImpact.total_view_count}

export async function main(): Promise<void> {
  await sendDiscordMessage('Meme bot is running...');

  const data = await callAuthAPI('/token/pairs?type=2', 'GET', {});
  const pairs = Object.values(data.data);

  const filteredPairs = pairs
    .map((pair: any) => {
      const supply = pair.supply || 1_000_000_000;
      const fdv = supply * pair.currentPrice;
      return {
        supply,
        fdv,
        ...pair,
      };
    })
    .filter((pair: any) => {
      return pair.current_liquidity > 10;
    });

  await sendDiscordMessage(
    `All/Filtered pairs: ${pairs.length}, ${filteredPairs.length}`,
  );

  for (let i = 0; i < filteredPairs.length; i++) {
    const pair: any = filteredPairs[i];
    console.log(
      `Checking pair ${i.toString().padStart(2, '0')}:`,
      pair.token_address,
    );
    const socialImpact = await getSocialImpactOfContractAddress(
      pair.token_address,
    );
    if (
      socialImpact.total_posts_count > 5 &&
      socialImpact.total_favorite_count > 50 &&
      socialImpact.total_followers_count > 500
    ) {
      // send info to discord
      await sendDiscordMessage(
        getDiscordMessage(pair.token_address, socialImpact),
      );
      // send an instruction to buy the token
      await sendDiscordMessage(`/buy ${pair.token_address} 0.05`);
    }
  }

  await sendDiscordMessage('Meme bot finished running.');

  return;
}
