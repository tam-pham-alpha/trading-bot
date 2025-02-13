import crypto from 'crypto';
import axios from 'axios';

/**
 * Refs
 * - https://autosnipe.gitbook.io/autosnipe-trading/advanced-trading/autosnipe-api-trading/autosnipe-rest-apis/authentication
 * - https://autosnipe.gitbook.io/autosnipe-trading/advanced-trading/autosnipe-api-trading/autosnipe-rest-apis/authentication/get-pairs
 */

const base_url = 'https://api.autosnipe.ai/sniper-api';

type APIConfig = {
  key: string;
  Secret: string;
};

type APIRequestBody = {
  url?: string;
  timeStamp_nonce?: string;
  [key: string]: any;
};

const data: APIConfig = {
  key: 'ETHP9X5vlIwuJCCtpitR', // Replace with your API key
  Secret: 'kvHR76uzOOCI2NOmOBO2BLNGw0LBmN', // Replace with your API secret
};

function getPayload(body: APIRequestBody): string {
  const content = {
    url: body.url,
    timeStamp_nonce: body.timeStamp_nonce,
    body: JSON.stringify(body),
  };
  return Buffer.from(JSON.stringify(content)).toString('base64');
}

function getSignature(payload: string, apiSecretKey: string): string {
  return crypto
    .createHmac('sha512', apiSecretKey)
    .update(payload)
    .digest('hex');
}

function displayData(list: any[]): void {
  list.forEach((item) => {
    console.log(item);
  });
}

export async function callAuthAPI(
  endPoint: string,
  method = 'GET',
  body: APIRequestBody = {},
): Promise<any> {
  try {
    const timeStamp_nonce = Date.now().toString();
    body.url = `${base_url}${endPoint}`;
    body.timeStamp_nonce = timeStamp_nonce;

    const payload = getPayload(body);
    const signature = getSignature(payload, data.Secret);

    const headers = {
      'x-autosnipe-apikey': data.key,
      'x-autosnipe-signature': signature,
      'Content-Type': 'application/json',
    };

    const response = await axios({
      url: body.url,
      method,
      headers,
      data: JSON.stringify(body),
    });

    // const resp: any = response.data.data;
    // const trending5m = Object.values(resp['5m']);
    // const trending1h = Object.values(resp['1h']);
    // const trending6h = Object.values(resp['6h']);
    // const trending24h = Object.values(resp['24h']);

    // displayData(trending24h);
    // console.log('Trending 5m:', trending5m.length);
    // console.log('Trending 1h:', trending1h.length);
    // console.log('Trending 6h:', trending6h.length);
    // console.log('Trending 24h:', trending24h.length);

    return response.data;
  } catch (error: any) {
    console.error(
      'Error Fetching Trading Pairs:',
      error.response ? error.response.data : error.message,
    );
    return null;
  }
}

// Call function to fetch trading pairs
callAuthAPI('/token/pairs?type=1', 'GET', {});
