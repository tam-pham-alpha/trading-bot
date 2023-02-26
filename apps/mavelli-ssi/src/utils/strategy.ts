import { uniqBy } from 'lodash';
import { Strategy } from '../strategies';

export const mergeStrategies = (
  newList: Partial<Strategy>[],
  fallback: Strategy,
) => {
  const aggList = uniqBy([...newList], 'symbol');

  return aggList.map((i) => {
    return {
      ...fallback,
      ...i,
    };
  });
};
