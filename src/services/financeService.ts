import { Invoice, Payment, FinancialPlan } from '../types';

const FINANCE_API = '/api/finance';
const PLANS_API = '/api/plans/financial';

export const getInvoices = async (companyId: string): Promise<Invoice[]> => {
  const response = await fetch(`${FINANCE_API}/invoices?companyId=${companyId}`);
  if (!response.ok) throw new Error('Failed to fetch invoices');
  return await response.json();
};

export const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
  const response = await fetch(`${FINANCE_API}/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  return await response.json();
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
  const response = await fetch(`${FINANCE_API}/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  });
  return await response.json();
};

export const getPayments = async (companyId: string): Promise<Payment[]> => {
  const response = await fetch(`${FINANCE_API}/payments?companyId=${companyId}`);
  if (!response.ok) throw new Error('Failed to fetch payments');
  return await response.json();
};

export const addPayment = async (payment: Omit<Payment, 'id'>) => {
  const response = await fetch(`${FINANCE_API}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payment),
  });
  return await response.json();
};

export const getFinancialPlans = async (companyId: string): Promise<FinancialPlan[]> => {
  const response = await fetch(`${PLANS_API}?companyId=${companyId}`);
  if (!response.ok) throw new Error('Failed to fetch financial plans');
  return await response.json();
};

export const addFinancialPlan = async (plan: Omit<FinancialPlan, 'id'>) => {
  const response = await fetch(PLANS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  return await response.json();
};

export const updateFinancialPlan = async (id: string, plan: Partial<FinancialPlan>) => {
  const response = await fetch(`${PLANS_API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  return await response.json();
};
