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
export const updateProductionPlan = (id: string, plan: Partial<ProductionPlan>) => updateDoc(doc(db, 'productionPlans', id), plan);
export const deleteProductionPlan = (id: string) => deleteDoc(doc(db, 'productionPlans', id));
export const addProcurementPlan = (plan: Omit<ProcurementPlan, 'id'>) => addDoc(collection(db, 'procurementPlans'), plan);
export const updateProcurementPlan = (id: string, plan: Partial<ProcurementPlan>) => updateDoc(doc(db, 'procurementPlans', id), plan);
export const deleteProcurementPlan = (id: string) => deleteDoc(doc(db, 'procurementPlans', id));
export const addSalesPlan = (plan: Omit<SalesPlan, 'id'>) => addDoc(collection(db, 'salesPlans'), plan);
export const updateSalesPlan = (id: string, plan: Partial<SalesPlan>) => updateDoc(doc(db, 'salesPlans', id), plan);
export const deleteSalesPlan = (id: string) => deleteDoc(doc(db, 'salesPlans', id));
