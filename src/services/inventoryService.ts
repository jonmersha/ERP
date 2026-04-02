import { PurchaseOrder, SalesOrder, UserProfile } from '../types';
import { apiFetch } from '../utils/api';

const API_BASE = '/api/inventory';

export const receivePurchaseOrder = async (
  selectedPO: PurchaseOrder, 
  warehouseId: string, 
  notes: string, 
  profile: UserProfile | null
) => {
  return await apiFetch(`${API_BASE}/receive-po`, {
    method: 'POST',
    body: JSON.stringify({ selectedPO, warehouseId, notes, profile }),
  });
};

export const transferProductionToWarehouse = async (
  productId: string,
  quantity: number,
  warehouseId: string,
  profile: UserProfile | null
) => {
  return await apiFetch(`${API_BASE}/transfer-production`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity, warehouseId, profile }),
  });
};

export const shipSalesOrder = async (
  selectedSO: SalesOrder, 
  warehouseId: string, 
  notes: string, 
  profile: UserProfile | null
) => {
  return await apiFetch(`${API_BASE}/ship-order`, {
    method: 'POST',
    body: JSON.stringify({ selectedSO, warehouseId, notes, profile }),
  });
};
