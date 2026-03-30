import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

export const createEmployee = async (form: any, profile: UserProfile | null) => {
  await addDoc(collection(db, 'employees'), {
    ...form,
    salary: Number(form.salary),
    hireDate: new Date(form.hireDate).toISOString(),
    companyId: profile?.companyId || ''
  });
};
