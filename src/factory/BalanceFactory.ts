import * as Sentry from '@sentry/node';

import { getAccountBalance } from '../biz/account';
import { Account } from '../types/Account';

class BalanceFactory {
  balance: Account = {} as Account;

  sync = (value: Account) => {
    this.balance = value;
  };

  update = async () => {
    try {
      const balance = await getAccountBalance();
      this.balance = balance;
    } catch (err) {
      Sentry.captureMessage(JSON.stringify(err), {
        tags: {
          type: 'Account.update',
        },
      });
    }
    return this.balance;
  };
}

export default new BalanceFactory();
