import * as Sentry from '@sentry/node';

import { getAccountBalance } from '../biz/account';
import { Account } from '../types/Account';

class BalanceFactory {
  balance: Account = {
    totalAssets: 0,
  } as Account;

  sync = (value: Account) => {
    this.balance = value;
  };

  getTotalAsset = () => {
    return this.balance.totalAssets || 0;
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
