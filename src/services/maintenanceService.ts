import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MaintenanceLog } from '../types';

const COLLECTION = 'maintenance_logs';

export const getMaintenanceLogs = async (companyId: string): Promise<MaintenanceLog[]> => {
  const q = query(collection(db, COLLECTION), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceLog));
};

export const addMaintenanceLog = (log: Omit<MaintenanceLog, 'id'>) => addDoc(collection(db, COLLECTION), log);
export const updateMaintenanceLog = (id: string, log: Partial<MaintenanceLog>) => updateDoc(doc(db, COLLECTION, id), log);
export const deleteMaintenanceLog = (id: string) => deleteDoc(doc(db, COLLECTION, id));
