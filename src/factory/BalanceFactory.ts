import * as Sentry from '@sentry/node';

import { getAccountBalance } from '../biz/account';
import { Account } from '../types/Account';

class BalanceFactory {
  balance: Account = {
    totalAssets: 0,
    purchasingPower: 0,
  } as Account;
  cashInventory = 0;

  sync = (value: Account) => {
    this.balance = value;
  };

  setCashInventory = (value: number) => {
    this.cashInventory = value;
  };

  getPurchasingPower = () => {
    return this.balance.purchasingPower;
  };

  getTotalAsset = () => {
    return this.balance.totalAssets || 0;
  };

  getIsBuying = () => {
    const cashPercentage = this.balance.totalAssets
      ? Math.floor(
          (this.balance.purchasingPower / this.balance.totalAssets) * 100,
        )
      : 0;
    const isBuying = cashPercentage > this.cashInventory;

    console.log(
      'BalanceFactory.getIsBuying',
      cashPercentage,
      this.cashInventory,
    );
    return isBuying;
  };

  update = async () => {
    try {
      const balance = await getAccountBalance();
      this.balance = balance;
    } catch (err) {
      Sentry.captureMessage(
        `Unable to update account balance: ${JSON.stringify(err)}`,
        {
          tags: {
            type: 'Account.update',
          },
        },
      );
    }
    return this.balance;
  };
}

export default new BalanceFactory();
