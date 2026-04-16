import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { systemSettings } from '../demo-data';

export class SettingsService {
  static async getSettings(): Promise<any> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'system'));
        if (docSnap.exists()) return docSnap.data();
      } catch (err) {}
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    return systemSettings;
  }
}
