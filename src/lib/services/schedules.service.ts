import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { scheduleVariances } from '../demo-data';

export class SchedulesService {
  static async getScheduleVariances(): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const snapshot = await getDocs(collection(db, 'scheduleVariances'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        return [];
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    return scheduleVariances;
  }

  static async getWeeklySnapshot() {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const docSnap = await getDoc(doc(db, 'dashboard', 'schedulesSnapshot'));
        if (docSnap.exists()) return docSnap.data();
      } catch (err) {}
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      totalScheduledHours: 420.5,
      totalActualHours: 435.0,
      forecastedImpact: 642.50,
      alertsCount: 3
    };
  }
}
