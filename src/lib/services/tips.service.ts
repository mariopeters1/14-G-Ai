import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { tipPools } from '../demo-data';

export class TipsService {
  static async getTipPools(date?: string): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        let q = collection(db, 'tipPools');
        if (date) {
          q = query(q, where('date', '==', date)) as any;
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return [];
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    if (date) {
      return tipPools.filter(pool => pool.date === date);
    }
    return tipPools;
  }
}
