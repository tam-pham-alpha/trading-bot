export const getChangeByDelta = (number: number, delta: number) => {
  return Math.round(number * delta) / 100;
};

export const getPriceByDelta = (price: number, delta: number, tickSize = 4) => {
  return (
    Math.round(((price * (100 + delta)) / 100) * Math.pow(10, tickSize)) /
    Math.pow(10, tickSize)
  );
};

export const getValidNumber = (value: number, dp: number) => {
  return Math.floor(value * Math.pow(10, dp)) / Math.pow(10, dp);
};

export const matchExpectedPrice = (
  price: number,
  avgPrice: number,
  delta: number,
  tickSize = 4,
) => {
  const expectedPrice = getPriceByDelta(avgPrice, delta, tickSize);
  return price >= expectedPrice;
};
