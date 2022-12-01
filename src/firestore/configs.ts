import { Strategy } from '../strategies';
import { ConfigCollection } from './firestore';

export type FirebaseStrategy = Partial<Strategy>;

const DEFAULT_STRATEGY_DOC = 'default-strategy';

export const fetchDefaultStrategy = async (): Promise<FirebaseStrategy> => {
  return ConfigCollection.doc(DEFAULT_STRATEGY_DOC)
    .get()
    .then((resp) => {
      return resp.data() as FirebaseStrategy;
    });
};

export const onDefaultStrategyChange = (
  callback: (v: FirebaseStrategy) => void,
) => {
  const q = ConfigCollection.doc(DEFAULT_STRATEGY_DOC);
  return q.onSnapshot((sn) => {
    const data = sn.data() as FirebaseStrategy;
    callback(data);
  });
};
