export type Account = {
  account: string;
  cashBal: number;
  cashOnHold: number;
  secureAmount: number;
  withdrawable: number;
  receivingCashT1: number;
  receivingCashT2: number;
  matchedBuyVolume: number;
  matchedSellVolume: number;
  debt: number;
  unMatchedBuyVolume: number;
  unMatchedSellVolume: number;
  paidCashT1: number;
  paidCashT2: number;
  cia: number;
  purchasingPower: number;
  totalAssets: number;
};
