import { Shipment } from '../types';
import { apiFetch } from '../utils/api';

const API_BASE = '/api/logistics';

export const getShipments = async (): Promise<Shipment[]> => {
  return await apiFetch(`${API_BASE}/shipments`);
};

export const addShipment = async (shipment: Omit<Shipment, 'id'>) => {
  return await apiFetch(`${API_BASE}/shipments`, {
    method: 'POST',
    body: JSON.stringify(shipment),
  });
};

export const updateShipment = async (id: string, shipment: Partial<Shipment>) => {
  return await apiFetch(`${API_BASE}/shipments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(shipment),
  });
};

export const deleteShipment = async (id: string) => {
  return await apiFetch(`${API_BASE}/shipments/${id}`, {
    method: 'DELETE',
  });
};
