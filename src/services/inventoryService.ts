import { PurchaseOrder, SalesOrder, UserProfile } from '../types';

const API_BASE = '/api/inventory';

export const receivePurchaseOrder = async (
  selectedPO: PurchaseOrder, 
  warehouseId: string, 
  notes: string, 
  profile: UserProfile | null
) => {
  const response = await fetch(`${API_BASE}/receive-po`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedPO, warehouseId, notes, profile }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to receive purchase order');
  }
  return await response.json();
};

export const transferProductionToWarehouse = async (
  productId: string,
  quantity: number,
  warehouseId: string,
  profile: UserProfile | null
) => {
  const response = await fetch(`${API_BASE}/transfer-production`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity, warehouseId, profile }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to transfer production');
  }
  return await response.json();
};

export const shipSalesOrder = async (
  selectedSO: SalesOrder, 
  warehouseId: string, 
  notes: string, 
  profile: UserProfile | null
) => {
  const response = await fetch(`${API_BASE}/ship-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedSO, warehouseId, notes, profile }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to ship sales order');
  }
  return await response.json();
};
