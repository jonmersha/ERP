import { UserProfile } from '../types';

const API_BASE = '/api/production';

export const createProductionRun = async (form: any, profile: UserProfile | null) => {
  const response = await fetch(`${API_BASE}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  if (!response.ok) throw new Error('Failed to create production run');
  return await response.json();
};

export const updateProductionProgress = async (runId: string, quantityProduced: number, status: string) => {
  const response = await fetch(`${API_BASE}/runs/${runId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      quantityProduced, 
      status,
      updatedAt: new Date().toISOString()
    }),
  });
  if (!response.ok) throw new Error('Failed to update production progress');
  return await response.json();
};
