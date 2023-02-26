import { Strategy } from '../strategies';
import { StrategyCollection } from './firestore';

export type FirebaseStrategy = Partial<Strategy>;

export const fetchStrategies = async (): Promise<FirebaseStrategy[]> => {
  return StrategyCollection.get().then((resp) => {
    return resp.docs.map((i) => i.data());
  });
};

export const onDataChange = (callback: (v: FirebaseStrategy[]) => void) => {
  const q = StrategyCollection;
  return q.onSnapshot((sn) => {
    const list = sn.docChanges().map((i) => i.doc.data());
    callback(list);
  });
};
