import rn from 'random-number';

export const getRandom = rn.generator({
  min: 0,
  max: 99999999,
  integer: true,
});

export const toNumber = (str: string) => {
  return parseFloat(str);
};

export const getNumber = (number: number, digit: number = 0) => {
  return Math.round(number * Math.pow(10, digit)) / Math.pow(10, digit);
};
