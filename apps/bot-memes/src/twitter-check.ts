import axios from 'axios';

const TWEETSCOUT_API_KEY = 'f9a8b022-0625-4475-b6a5-fff9b62f7a92'; // Replace with your actual API key
const TWEETSCOUT_BASE_URL = 'https://api.tweetscout.io/v2';

type TwitterData = {
  handle: string;
  tokenAddress: string;
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

async function getRecentPosts(handle: string): Promise<string[]> {
  const options = {
    method: 'GET',
    url: `${TWEETSCOUT_BASE_URL}/list-tweets/${handle}`,
    headers: { Accept: 'application/json', ApiKey: TWEETSCOUT_API_KEY },
  };
  try {
    const { data } = await axios.request(options);
    return data?.tweets?.map((tweet: any) => tweet.text) || [];
  } catch (error) {
    console.error('Error fetching recent tweets:', error);
    return [];
  }
}

async function checkTokenMention(twitterData: TwitterData): Promise<void> {
  const { handle, tokenAddress } = twitterData;

  const score = await getTwitterScore(handle);
  console.log(`Twitter Score for ${handle}:`, score);

  const description = await getTwitterDescription(handle);
  const mentionsInDescription = description?.includes(tokenAddress) || false;
  console.log(`Token Address found in description: ${mentionsInDescription}`);

  // const posts = await getRecentPosts(handle);
  // const mentionsInPosts = posts.some((post) => post.includes(tokenAddress));
  // console.log(`Token Address found in posts: ${mentionsInPosts}`);
}

// Example usage
const twitterHandle = 'rus'; // Replace with actual Twitter handle
const tokenAddress = '6AJcP7wuLwmRYLBNbi825wgguaPsWzPBEHcHndpRpump'; // Replace with actual token address

checkTokenMention({ handle: twitterHandle, tokenAddress });
