// @ts-nocheck
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../mavelli-ssi-firebase-adminsdk.json';

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export const StrategyCollection = db.collection('strategies');
export const ConfigCollection = db.collection('configs');
