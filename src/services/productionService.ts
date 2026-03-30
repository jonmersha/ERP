import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { ProductionPlan, UserProfile } from '../types';

export const createProductionPlan = async (form: any, profile: UserProfile | null) => {
  await addDoc(collection(db, 'productionPlans'), {
    ...form,
    quantity: Number(form.quantity),
    quantityProduced: 0,
    startDate: new Date(form.startDate).toISOString(),
    status: 'planned',
    companyId: profile?.companyId || ''
  });
};

export const updateProductionProgress = async (planId: string, quantityProduced: number, status: ProductionPlan['status']) => {
  await updateDoc(doc(db, 'productionPlans', planId), { quantityProduced, status });
};
