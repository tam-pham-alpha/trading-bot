import rn from 'random-number';

export const getRandom = rn.generator({
  min: 0,
  max: 99999999,
  integer: true,
});
