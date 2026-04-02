import { MaintenanceLog } from '../types';
import { apiFetch } from '../utils/api';

const API_BASE = '/api/maintenance';

export const getMaintenanceLogs = async (): Promise<MaintenanceLog[]> => {
  return await apiFetch(`${API_BASE}/logs`);
};

export const addMaintenanceLog = async (log: Omit<MaintenanceLog, 'id'>) => {
  return await apiFetch(`${API_BASE}/logs`, {
    method: 'POST',
    body: JSON.stringify(log),
  });
};

export const updateMaintenanceLog = async (id: string, log: Partial<MaintenanceLog>) => {
  return await apiFetch(`${API_BASE}/logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(log),
  });
};

export const deleteMaintenanceLog = async (id: string) => {
  return await apiFetch(`${API_BASE}/logs/${id}`, {
    method: 'DELETE',
  });
};
