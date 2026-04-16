import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { timeEntries } from '../demo-data';

export class TimeService {
  static async getTimeEntries(date?: string): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        let q = collection(db, 'timeEntries');
        if (date) {
          q = query(q, where('date', '==', date)) as any;
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return [];
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 600));
    if (date) {
      return timeEntries.filter(entry => entry.date === date);
    }
    return timeEntries;
  }

  static async getFlaggedEntries(): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const q = query(collection(db, 'timeEntries'), where('status', '==', 'flagged'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return [];
      }
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    return timeEntries.filter(entry => entry.status === 'flagged');
  }

  static async getPendingEdits(): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const q = query(collection(db, 'timeEntries'), where('status', '==', 'pending'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return [];
      }
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    return timeEntries.filter(entry => entry.status === 'pending');
  }
}
