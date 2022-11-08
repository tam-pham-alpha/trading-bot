export const getBuyingStocks = (
  strategies: string[],
  stoppedStocks: string[],
) => {
  const list = stoppedStocks.join(', ');
  return strategies.filter((i) => list.indexOf(i) < 0);
};
