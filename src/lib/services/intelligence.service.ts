import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { intelligenceTrends } from '../demo-data';

export class IntelligenceService {
  static async getTrends(): Promise<any> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const docSnap = await getDoc(doc(db, 'intelligence', 'trends'));
        if (docSnap.exists()) return docSnap.data();
      } catch (err) {}
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    return intelligenceTrends;
  }
}
