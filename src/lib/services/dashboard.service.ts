import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { dashboardStats, overtimeAlerts, pendingApprovals } from '@/lib/demo-data';

export class DashboardService {
  static async getKPIs(): Promise<any> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const docSnap = await getDoc(doc(db, 'dashboard', 'kpis'));
        if (docSnap.exists()) return docSnap.data();
      } catch (err) {}
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    return dashboardStats;
  }

  static async getOvertimeAlerts(): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const docSnap = await getDoc(doc(db, 'dashboard', 'overtimeAlerts'));
        if (docSnap.exists()) return docSnap.data()?.alerts || [];
      } catch (err) {}
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    return overtimeAlerts;
  }

  static async getPendingApprovals(): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const docSnap = await getDoc(doc(db, 'dashboard', 'pendingApprovals'));
        if (docSnap.exists()) return docSnap.data()?.approvals || [];
      } catch (err) {}
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    return pendingApprovals;
  }
}
