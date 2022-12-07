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
      return response.data.data as Account;
    })
    .catch(() => {
      Sentry.captureMessage('Unable to load account balance', {});
      return {} as any;
    });
};
