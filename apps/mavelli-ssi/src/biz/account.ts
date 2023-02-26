import client from 'ssi-api-client';
import * as Sentry from '@sentry/node';

import { fetch } from '../utils/fetch';
import { spot } from '../mock';
import { Account } from '../types/Account';

export const getAccountBalance = async () => {
  const request = {
    account: spot.account,
  };

  return fetch({
    url: client.api.GET_ACCOUNT_BALANCE,
    method: 'get',
    params: request,
  })
    .then((response) => {
      if (response.data.status === 401) {
        throw new Error(response.data.message);
      }
      return response.data.data as Account;
    })
    .catch((err) => {
      Sentry.captureMessage(
        `Unable to load account balance: ${JSON.stringify(err)}`,
        {},
      );
      throw err;
    });
};
