import { uniqBy } from 'lodash';
import { Strategy } from '../strategies';

export const mergeStrategies = (
  oldList: Strategy[],
  newList: Partial<Strategy>[],
  fallback: Strategy,
) => {
  const aggList = uniqBy([...oldList, ...newList], 'symbol');

  return aggList.map((i) => {
    const configStrategy = newList.find((c) => c.symbol === i.symbol);
    return {
      ...fallback,
      ...i,
      ...configStrategy,
    };
  });
};
