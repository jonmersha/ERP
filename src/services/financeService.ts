import { Invoice, Payment, FinancialPlan } from '../types';
import { apiFetch } from '../utils/api';

const FINANCE_API = '/api/finance';
const PLANS_API = '/api/plans/financial';

export const getInvoices = async (): Promise<Invoice[]> => {
  return await apiFetch(`${FINANCE_API}/invoices`);
};

export const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
  return await apiFetch(`${FINANCE_API}/invoices`, {
    method: 'POST',
    body: JSON.stringify(invoice),
  });
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
  return await apiFetch(`${FINANCE_API}/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoice),
  });
};

export const getPayments = async (): Promise<Payment[]> => {
  return await apiFetch(`${FINANCE_API}/payments`);
};

export const addPayment = async (payment: Omit<Payment, 'id'>) => {
  return await apiFetch(`${FINANCE_API}/payments`, {
    method: 'POST',
    body: JSON.stringify(payment),
  });
};

export const getFinancialPlans = async (): Promise<FinancialPlan[]> => {
  return await apiFetch(PLANS_API);
};

export const addFinancialPlan = async (plan: Omit<FinancialPlan, 'id'>) => {
  return await apiFetch(PLANS_API, {
    method: 'POST',
    body: JSON.stringify(plan),
  });
};

export const updateFinancialPlan = async (id: string, plan: Partial<FinancialPlan>) => {
  return await apiFetch(`${PLANS_API}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plan),
  });
};
