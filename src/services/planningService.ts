import { ProductionPlan, ProcurementPlan, SalesPlan } from '../types';

const API_BASE = '/api/plans';

const getPlans = async <T>(type: string, companyId: string): Promise<T[]> => {
  const response = await fetch(`${API_BASE}/${type}?companyId=${companyId}`);
  if (!response.ok) throw new Error(`Failed to fetch ${type} plans`);
  return await response.json();
};

export const getProductionPlans = (companyId: string) => getPlans<ProductionPlan>('production', companyId);
export const getProcurementPlans = (companyId: string) => getPlans<ProcurementPlan>('procurement', companyId);
export const getSalesPlans = (companyId: string) => getPlans<SalesPlan>('sales', companyId);

export const addProductionPlan = async (plan: Omit<ProductionPlan, 'id'>) => {
  const response = await fetch(`${API_BASE}/production`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  return await response.json();
};

export const updateProductionPlan = async (id: string, plan: Partial<ProductionPlan>) => {
  const response = await fetch(`${API_BASE}/production/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  return await response.json();
};

export const deleteProductionPlan = async (id: string) => {
  const response = await fetch(`${API_BASE}/production/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
};

export const addProcurementPlan = async (plan: Omit<ProcurementPlan, 'id'>) => {
  const response = await fetch(`${API_BASE}/procurement`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  return await response.json();
};

export const updateProcurementPlan = async (id: string, plan: Partial<ProcurementPlan>) => {
  const response = await fetch(`${API_BASE}/procurement/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  return await response.json();
};

export const deleteProcurementPlan = async (id: string) => {
  const response = await fetch(`${API_BASE}/procurement/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
};

export const addSalesPlan = async (plan: Omit<SalesPlan, 'id'>) => {
  const response = await fetch(`${API_BASE}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  return await response.json();
};

export const updateSalesPlan = async (id: string, plan: Partial<SalesPlan>) => {
  const response = await fetch(`${API_BASE}/sales/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  return await response.json();
};

export const deleteSalesPlan = async (id: string) => {
  const response = await fetch(`${API_BASE}/sales/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
};
