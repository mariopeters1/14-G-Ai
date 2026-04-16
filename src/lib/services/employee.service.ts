import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { employees as initialMockEmployees } from '@/lib/demo-data';

// Local mock state for demo mutation
let mockEmployees = [...initialMockEmployees];

export class EmployeeService {
  static async getEmployees(): Promise<any[]> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const snapshot = await getDocs(collection(db, 'employees'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.error("Firebase fetch error:", err);
        return [];
      }
    }
    
    // Fallback to mocks
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEmployees;
  }

  static async getEmployeeById(id: string): Promise<any | null> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const docSnap = await getDoc(doc(db, 'employees', id));
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      } catch (err) {
        console.error("Firebase fetch error:", err);
        return null;
      }
    }

    // Fallback to mocks
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockEmployees.find(emp => emp.id === id) || null;
  }

  static async createEmployee(data: any): Promise<any> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        const docRef = await addDoc(collection(db, 'employees'), data);
        return { id: docRef.id, ...data };
      } catch (err) {
        console.error("Firebase create error:", err);
        throw err;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    const newEmp = { id: `emp-${Date.now()}`, ...data };
    mockEmployees = [newEmp, ...mockEmployees];
    return newEmp;
  }

  static async updateEmployee(id: string, data: any): Promise<any> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        await updateDoc(doc(db, 'employees', id), data);
        return { id, ...data };
      } catch (err) {
        console.error("Firebase update error:", err);
        throw err;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    mockEmployees = mockEmployees.map(emp => emp.id === id ? { ...emp, ...data } : emp);
    return { id, ...data };
  }

  static async deleteEmployee(id: string): Promise<boolean> {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true' && db) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        return true;
      } catch (err) {
        console.error("Firebase delete error:", err);
        throw err;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    mockEmployees = mockEmployees.filter(emp => emp.id !== id);
    return true;
  }
}
