import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { complianceDocuments } from '../demo-data';

export class DocumentsService {
  static async getDocuments(): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const snapshot = await getDocs(collection(db, 'documents'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return [];
      }
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    return complianceDocuments;
  }
}
