import client from 'ssi-api-client';

import { fetch } from '../utils/fetch';
import { spot } from '../mock';

export const getAccountBalance = () => {
  const request = {
    account: spot.account,
  };

  fetch({
    url: client.api.GET_ACCOUNT_BALANCE,
    method: 'get',
    params: request,
  }).then((response) => {
    return response.data.data;
  });
};
