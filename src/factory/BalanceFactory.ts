import { getAccountBalance } from '../biz/account';
import { Account } from '../types/Account';

class BalanceFactory {
  balance: Account = {} as Account;

  sync = (value: Account) => {
    this.balance = value;
  };

  update = async () => {
    this.balance = await getAccountBalance();
    return this.balance;
  };
}

export default new BalanceFactory();
