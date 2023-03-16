/* eslint-disable no-console */
import { toNumber } from 'lodash';
import { client as clientSrc } from '../client';

class BalanceFactory {
  client;
  balances: Record<string, number> = {};
  cashInventory = 2000;

  constructor() {
    this.client = clientSrc;
  }

  sync = async () => {
    const accounts = await this.client.accountInfo();
    const positiveAccounts = accounts.balances
      .map((i) => ({
        ...i,
        free: toNumber(i.free),
      }))
      .filter((i) => i.free > 0 && i.asset.indexOf('LD') < 0);

    positiveAccounts.forEach((i) => {
      this.balances[i.asset] = i.free;
    });
  };

  get = (asset: string) => {
    return this.balances[asset] || 0;
  };

  set = (asset: string, value: number) => {
    this.balances[asset] = value;
  };

  setCashInventory = (value: number) => {
    this.cashInventory = value;
  };

  getIsActive = () => {
    return this.get('USDT') >= this.cashInventory;
  };

  print = () => {
    console.log('R. ACCOUNTS');
    console.table(
      Object.keys(this.balances).map((i) => ({
        asset: i,
        balance: this.balances[i],
      })),
    );
  };
}

export default new BalanceFactory();
