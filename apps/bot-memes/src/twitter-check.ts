import axios from 'axios';
import { sendDiscordMessage } from './discord';

/**
 * Refs
 * - https://api.tweetscout.io/v2/docs/#/paths/search-tweets/post
 */

const TWEETSCOUT_API_KEY = 'f9a8b022-0625-4475-b6a5-fff9b62f7a92'; // Replace with your actual API key
const TWEETSCOUT_BASE_URL = 'https://api.tweetscout.io/v2';
const MAX_PAGES = 10;

type TwitterData = {
  handle: string;
  contractAddress: string;
};

type TweetResponse = {
  data: any[];
  cursor?: string;
};

export type SocialImpact = {
  // user
  total_followers_count: number;
  total_friends_count: number;
  total_posts_count: number;
  // tweet
  total_quote_count: number;
  total_reply_count: number;
  total_retweet_count: number;
  total_view_count: number;
  total_favorite_count: number;
};

async function getTwitterScore(handle: string): Promise<number | null> {
  const options = {
    method: 'GET',
    url: `${TWEETSCOUT_BASE_URL}/score/${handle}`,
    headers: { Accept: 'application/json', ApiKey: TWEETSCOUT_API_KEY },
  };
  try {
    const { data } = await axios.request(options);
    return data?.score || null;
  } catch (error) {
    console.error('Error fetching Twitter score:', error);
    return null;
  }
}

async function getTwitterDescription(handle: string): Promise<string | null> {
  const options = {
    method: 'GET',
    url: `${TWEETSCOUT_BASE_URL}/info/${handle}`,
    headers: { Accept: 'application/json', ApiKey: TWEETSCOUT_API_KEY },
  };
  try {
    const { data } = await axios.request(options);
    return data?.description || null;
  } catch (error) {
    console.error('Error fetching Twitter description:', error);
    return null;
  }
}

const fetchTweets = async (contractAddress: string) => {
  let cursor = '';
  let allResults: any[] = [];

  const options = {
    method: 'POST',
    url: `${TWEETSCOUT_BASE_URL}/search-tweets`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ApiKey: TWEETSCOUT_API_KEY,
    },
    data: '',
  };

  for (let page = 0; page < MAX_PAGES; page++) {
    try {
      if (cursor) {
        options.data = JSON.stringify({ query: contractAddress, cursor });
      } else {
        options.data = JSON.stringify({ query: contractAddress });
      }

      const { data } = await axios.request(options);

      if (data?.tweets) {
        allResults = allResults.concat(data.tweets);
      }

      cursor = data.next_cursor;
      if (!cursor) break; // Stop if there's no more cursor
    } catch (error) {
      console.error(`Error fetching page ${page + 1}:`, error);
      await sendDiscordMessage(`Out of tweetscout quota.`);
      break;
    }
  }

  return allResults;
};

function displayData(list: any[]): void {
  list.forEach((item) => {
    console.log(item);
  });
}

export const getSocialImpactOfContractAddress = async (
  contractAddress: string,
): Promise<SocialImpact> => {
  const posts = await fetchTweets(contractAddress);

  const socialImpact: SocialImpact = posts.reduce(
    (acc, post) => {
      return {
        total_followers_count:
          acc.total_followers_count + post.user.followers_count,
        total_friends_count: acc.total_friends_count + post.user.friends_count,
        total_quote_count: acc.total_quote_count + post.quote_count,
        total_reply_count: acc.total_reply_count + post.reply_count,
        total_retweet_count: acc.total_retweet_count + post.retweet_count,
        total_view_count: acc.total_view_count + post.view_count,
        total_favorite_count: acc.total_favorite_count + post.favorite_count,
      };
    },
    {
      total_followers_count: 0,
      total_friends_count: 0,
      total_quote_count: 0,
      total_reply_count: 0,
      total_retweet_count: 0,
      total_view_count: 0,
      total_favorite_count: 0,
    },
  );

  return {
    ...socialImpact,
    total_posts_count: posts.length,
  };
};

export async function checkTokenMention(
  twitterData: TwitterData,
): Promise<void> {
  const { contractAddress } = twitterData;
  // const posts = await fetchTweets(contractAddress);
  // console.log('Recent Tweets:', posts.length);
  const socialImpact = await getSocialImpactOfContractAddress(contractAddress);
  console.log('Social Impact:', socialImpact);
}
