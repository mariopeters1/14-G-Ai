import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { payrollRuns } from '../demo-data';

export class PayrollService {
  static async getPayrollRuns(): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const snapshot = await getDocs(collection(db, 'payrollRuns'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return [];
      }
    }
    await new Promise(resolve => setTimeout(resolve, 600));
    return payrollRuns;
  }

  static async getDraftRun() {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const docSnap = await getDoc(doc(db, 'payrollRuns', 'draft'));
        if (docSnap.exists()) return docSnap.data();
      } catch (err) {}
    }
    await new Promise(resolve => setTimeout(resolve, 400));
    return payrollRuns.find(run => run.status === 'Draft') || null;
  }
}
