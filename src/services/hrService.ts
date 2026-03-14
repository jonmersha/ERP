import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const createEmployee = async (form: any) => {
  await addDoc(collection(db, 'employees'), {
    ...form,
    salary: Number(form.salary),
    hireDate: new Date(form.hireDate).toISOString()
  });
};
