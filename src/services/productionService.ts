import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

export const createProductionRun = async (form: any, profile: UserProfile | null) => {
  await addDoc(collection(db, 'productionRuns'), {
    ...form,
    quantity: Number(form.quantity),
    quantityProduced: 0,
    startDate: new Date(form.startDate).toISOString(),
    status: 'planned',
    companyId: profile?.companyId || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
};

export const updateProductionProgress = async (runId: string, quantityProduced: number, status: string) => {
  await updateDoc(doc(db, 'productionRuns', runId), { 
    quantityProduced, 
    status,
    updatedAt: new Date().toISOString()
  });
};
