import axios from 'axios';
import config from '../config';

let access_token = '';

const req = axios.create({
  baseURL: config.trading.URL,
  timeout: 5000,
});

export const setAccessToken = (token: string) => {
  access_token = token;
};

export const fetch = (opts: any) => {
  return req({
    ...opts,
    headers: {
      Authorization: `Bearer ${access_token}`,
      ...opts.headers,
    },
  });
};
