import { ProductionPlan, ProcurementPlan, SalesPlan } from '../types';
import { apiService } from './apiService';

const getPlans = async <T>(collectionName: string, companyId: string): Promise<T[]> => {
  return apiService.fetchCollection<T>(collectionName, companyId);
};

export const getProductionPlans = (companyId: string) => getPlans<ProductionPlan>('productionPlans', companyId);
export const getProcurementPlans = (companyId: string) => getPlans<ProcurementPlan>('procurementPlans', companyId);
export const getSalesPlans = (companyId: string) => getPlans<SalesPlan>('salesPlans', companyId);

export const addProductionPlan = async (plan: Omit<ProductionPlan, 'id'>) => {
  return apiService.addDocument('productionPlans', { ...plan, createdAt: new Date().toISOString() });
};

export const updateProductionPlan = async (id: string, plan: Partial<ProductionPlan>) => {
  return apiService.updateDocument('productionPlans', id, plan);
};

export const deleteProductionPlan = async (id: string) => {
  return apiService.deleteDocument('productionPlans', id);
};

export const addProcurementPlan = async (plan: Omit<ProcurementPlan, 'id'>) => {
  return apiService.addDocument('procurementPlans', { ...plan, createdAt: new Date().toISOString() });
};

export const updateProcurementPlan = async (id: string, plan: Partial<ProcurementPlan>) => {
  return apiService.updateDocument('procurementPlans', id, plan);
};

export const deleteProcurementPlan = async (id: string) => {
  return apiService.deleteDocument('procurementPlans', id);
};

export const addSalesPlan = async (plan: Omit<SalesPlan, 'id'>) => {
  return apiService.addDocument('salesPlans', { ...plan, createdAt: new Date().toISOString() });
};

export const updateSalesPlan = async (id: string, plan: Partial<SalesPlan>) => {
  return apiService.updateDocument('salesPlans', id, plan);
};

export const deleteSalesPlan = async (id: string) => {
  return apiService.deleteDocument('salesPlans', id);
};
