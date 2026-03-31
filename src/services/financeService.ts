import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Invoice, Payment, FinancialPlan } from '../types';

export const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
  return await addDoc(collection(db, 'invoices'), invoice);
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
  return await updateDoc(doc(db, 'invoices', id), invoice);
};

export const addPayment = async (payment: Omit<Payment, 'id'>) => {
  return await addDoc(collection(db, 'payments'), payment);
};

export const addFinancialPlan = async (plan: Omit<FinancialPlan, 'id'>) => {
  return await addDoc(collection(db, 'financialPlans'), plan);
};

export const updateFinancialPlan = async (id: string, plan: Partial<FinancialPlan>) => {
  return await updateDoc(doc(db, 'financialPlans', id), plan);
};
