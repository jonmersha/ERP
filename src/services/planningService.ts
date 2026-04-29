import { ProductionPlan, ProcurementPlan, SalesPlan } from '../types';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';

const getPlans = async <T>(collectionName: string, companyId: string): Promise<T[]> => {
  const q = query(collection(db, collectionName), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
};

export const getProductionPlans = (companyId: string) => getPlans<ProductionPlan>('productionPlans', companyId);
export const getProcurementPlans = (companyId: string) => getPlans<ProcurementPlan>('procurementPlans', companyId);
export const getSalesPlans = (companyId: string) => getPlans<SalesPlan>('salesPlans', companyId);

export const addProductionPlan = async (plan: Omit<ProductionPlan, 'id'>) => {
  const docRef = await addDoc(collection(db, 'productionPlans'), { ...plan, createdAt: new Date().toISOString() });
  return { id: docRef.id, ...plan };
};

export const updateProductionPlan = async (id: string, plan: Partial<ProductionPlan>) => {
  await updateDoc(doc(db, 'productionPlans', id), plan);
  return { id, ...plan };
};

export const deleteProductionPlan = async (id: string) => {
  await deleteDoc(doc(db, 'productionPlans', id));
  return { id, deleted: true };
};

export const addProcurementPlan = async (plan: Omit<ProcurementPlan, 'id'>) => {
  const docRef = await addDoc(collection(db, 'procurementPlans'), { ...plan, createdAt: new Date().toISOString() });
  return { id: docRef.id, ...plan };
};

export const updateProcurementPlan = async (id: string, plan: Partial<ProcurementPlan>) => {
  await updateDoc(doc(db, 'procurementPlans', id), plan);
  return { id, ...plan };
};

export const deleteProcurementPlan = async (id: string) => {
  await deleteDoc(doc(db, 'procurementPlans', id));
  return { id, deleted: true };
};

export const addSalesPlan = async (plan: Omit<SalesPlan, 'id'>) => {
  const docRef = await addDoc(collection(db, 'salesPlans'), { ...plan, createdAt: new Date().toISOString() });
  return { id: docRef.id, ...plan };
};

export const updateSalesPlan = async (id: string, plan: Partial<SalesPlan>) => {
  await updateDoc(doc(db, 'salesPlans', id), plan);
  return { id, ...plan };
};

export const deleteSalesPlan = async (id: string) => {
  await deleteDoc(doc(db, 'salesPlans', id));
  return { id, deleted: true };
};
