import { UserProfile } from '../types';
import { apiFetch } from '../utils/api';

const API_BASE = '/api/production';

export const createProductionRun = async (form: any, profile: UserProfile | null) => {
  return await apiFetch(`${API_BASE}/runs`, {
    method: 'POST',
    body: JSON.stringify({
      ...form,
      quantity: Number(form.quantity),
      quantityProduced: 0,
      startDate: new Date(form.startDate).toISOString(),
      status: 'planned',
      companyId: profile?.companyId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }),
  });
};

export const updateProductionProgress = async (runId: string, quantityProduced: number, status: string) => {
  return await apiFetch(`${API_BASE}/runs/${runId}`, {
    method: 'PUT',
    body: JSON.stringify({ 
      quantityProduced, 
      status,
      updatedAt: new Date().toISOString()
    }),
  });
};
