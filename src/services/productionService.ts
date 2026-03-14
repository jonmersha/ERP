import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { ProductionPlan } from '../types';

export const createProductionPlan = async (form: any) => {
  await addDoc(collection(db, 'productionPlans'), {
    ...form,
    quantity: Number(form.quantity),
    startDate: new Date(form.startDate).toISOString()
  });
};

export const updateProductionPlanStatus = async (planId: string, status: ProductionPlan['status']) => {
  await updateDoc(doc(db, 'productionPlans', planId), { status });
};
