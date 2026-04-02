import { ProductionPlan, ProcurementPlan, SalesPlan } from '../types';
import { apiFetch } from '../utils/api';

const API_BASE = '/api/plans';

const getPlans = async <T>(type: string): Promise<T[]> => {
  return await apiFetch(`${API_BASE}/${type}`);
};

export const getProductionPlans = () => getPlans<ProductionPlan>('production');
export const getProcurementPlans = () => getPlans<ProcurementPlan>('procurement');
export const getSalesPlans = () => getPlans<SalesPlan>('sales');

export const addProductionPlan = async (plan: Omit<ProductionPlan, 'id'>) => {
  return await apiFetch(`${API_BASE}/production`, {
    method: 'POST',
    body: JSON.stringify(plan),
  });
};

export const updateProductionPlan = async (id: string, plan: Partial<ProductionPlan>) => {
  return await apiFetch(`${API_BASE}/production/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plan),
  });
};

export const deleteProductionPlan = async (id: string) => {
  return await apiFetch(`${API_BASE}/production/${id}`, {
    method: 'DELETE',
  });
};

export const addProcurementPlan = async (plan: Omit<ProcurementPlan, 'id'>) => {
  return await apiFetch(`${API_BASE}/procurement`, {
    method: 'POST',
    body: JSON.stringify(plan),
  });
};

export const updateProcurementPlan = async (id: string, plan: Partial<ProcurementPlan>) => {
  return await apiFetch(`${API_BASE}/procurement/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plan),
  });
};

export const deleteProcurementPlan = async (id: string) => {
  return await apiFetch(`${API_BASE}/procurement/${id}`, {
    method: 'DELETE',
  });
};

export const addSalesPlan = async (plan: Omit<SalesPlan, 'id'>) => {
  return await apiFetch(`${API_BASE}/sales`, {
    method: 'POST',
    body: JSON.stringify(plan),
  });
};

export const updateSalesPlan = async (id: string, plan: Partial<SalesPlan>) => {
  return await apiFetch(`${API_BASE}/sales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plan),
  });
};

export const deleteSalesPlan = async (id: string) => {
  return await apiFetch(`${API_BASE}/sales/${id}`, {
    method: 'DELETE',
  });
};
