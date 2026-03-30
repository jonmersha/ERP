import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ProductionPlan, ProcurementPlan, SalesPlan } from '../types';

const getPlans = async <T>(collectionName: string, companyId: string): Promise<T[]> => {
  const q = query(collection(db, collectionName), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export const getProductionPlans = (companyId: string) => getPlans<ProductionPlan>('productionPlans', companyId);
export const getProcurementPlans = (companyId: string) => getPlans<ProcurementPlan>('procurementPlans', companyId);
export const getSalesPlans = (companyId: string) => getPlans<SalesPlan>('salesPlans', companyId);

export const addProductionPlan = (plan: Omit<ProductionPlan, 'id'>) => addDoc(collection(db, 'productionPlans'), plan);
export const addProcurementPlan = (plan: Omit<ProcurementPlan, 'id'>) => addDoc(collection(db, 'procurementPlans'), plan);
export const addSalesPlan = (plan: Omit<SalesPlan, 'id'>) => addDoc(collection(db, 'salesPlans'), plan);
