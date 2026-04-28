import { MaintenanceLog } from '../types';

const API_BASE = '/api/maintenance';

export const getMaintenanceLogs = async (companyId: string): Promise<MaintenanceLog[]> => {
  const response = await fetch(`${API_BASE}/logs?companyId=${companyId}`);
  if (!response.ok) throw new Error('Failed to fetch maintenance logs');
  return await response.json();
};

export const addMaintenanceLog = async (log: Omit<MaintenanceLog, 'id'>) => {
  const response = await fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  if (!response.ok) throw new Error('Failed to add maintenance log');
  return await response.json();
};

export const updateMaintenanceLog = async (id: string, log: Partial<MaintenanceLog>) => {
  const response = await fetch(`${API_BASE}/logs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  if (!response.ok) throw new Error('Failed to update maintenance log');
  return await response.json();
};

export const deleteMaintenanceLog = async (id: string) => {
  const response = await fetch(`${API_BASE}/logs/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete maintenance log');
  return await response.json();
};
