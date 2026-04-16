import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from './config';

// Base helper for collections
export const getCollection = (collectionName: string) => collection(db, collectionName);

// Example adapter shell for future user fetching
export const getUserDoc = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
};
