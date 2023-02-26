import axios from 'axios';
import config from '../config';

let access_token = '';

const req = axios.create({
  baseURL: config.market.ApiUrl,
  timeout: 5000,
});

export const setDataAccessToken = (token: string) => {
  access_token = token;
};

export const dataFetch = (opts: any) => {
  return req({
    ...opts,
    headers: {
      Authorization: `Bearer ${access_token}`,
      ...opts.headers,
    },
  });
};
