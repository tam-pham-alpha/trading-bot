import { Strategy } from '../strategies';
import { MavelliConfig } from '../types/Mavelli';
import { ConfigCollection } from './firestore';

export type FirebaseStrategy = Partial<Strategy>;
export type FirebaseMavelliConfig = Partial<MavelliConfig>;

const DEFAULT_STRATEGY_DOC = 'default-strategy';
const MAVELLI_DOC = 'mavelli';

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

export const fetchMavelliConfig = async (): Promise<FirebaseMavelliConfig> => {
  return ConfigCollection.doc(MAVELLI_DOC)
    .get()
    .then((resp) => {
      return resp.data() as FirebaseMavelliConfig;
    });
};

export const onMavelliConfigChange = (
  callback: (v: FirebaseMavelliConfig) => void,
) => {
  const q = ConfigCollection.doc(MAVELLI_DOC);
  return q.onSnapshot((sn) => {
    const data = sn.data() as FirebaseMavelliConfig;
    callback(data);
  });
};
