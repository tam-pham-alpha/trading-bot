import rn from 'random-number';

export const getRandom = rn.generator({
  min: 0,
  max: 99999999,
  integer: true,
});

export const toNumber = (str: string) => {
  return parseFloat(str);
};

export const roundByDp = (number: number, dp: number) => {
  return Math.floor(number * Math.pow(10, dp)) / Math.pow(10, dp);
};

export const roundByTickSize = (number: number, tickSize: number) => {
  return Math.floor(number / Math.pow(10, tickSize)) * Math.pow(10, tickSize);
};

export const getNumberByPercentage = (
  number: number,
  delta: number,
  tickSize = 0,
) => {
  return roundByTickSize((number * (100 + delta)) / 100, tickSize);
};
