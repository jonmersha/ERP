import { Shipment } from '../types';

const API_BASE = '/api/logistics';

export const getShipments = async (companyId: string): Promise<Shipment[]> => {
  const response = await fetch(`${API_BASE}/shipments?companyId=${companyId}`);
  if (!response.ok) throw new Error('Failed to fetch shipments');
  return await response.json();
};

export const addShipment = async (shipment: Omit<Shipment, 'id'>) => {
  const response = await fetch(`${API_BASE}/shipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipment),
  });
  if (!response.ok) throw new Error('Failed to add shipment');
  return await response.json();
};

export const updateShipment = async (id: string, shipment: Partial<Shipment>) => {
  const response = await fetch(`${API_BASE}/shipments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shipment),
  });
  if (!response.ok) throw new Error('Failed to update shipment');
  return await response.json();
};

export const deleteShipment = async (id: string) => {
  const response = await fetch(`${API_BASE}/shipments/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete shipment');
  return await response.json();
};
