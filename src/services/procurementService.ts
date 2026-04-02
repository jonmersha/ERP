import { Supplier, PurchaseOrder, PurchaseOrderItem, UserProfile } from '../types';
import { apiFetch } from '../utils/api';

const API_BASE = '/api/procurement';

export const createPurchaseOrder = async (
  poForm: any, 
  suppliers: Supplier[], 
  profile: UserProfile | null
) => {
  const totalAmount = poForm.items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.quantity * item.price), 0);
  const supplier = suppliers.find(s => s.id === poForm.supplierId);
  
  return await apiFetch(`${API_BASE}/orders`, {
    method: 'POST',
    body: JSON.stringify({
      ...poForm,
      supplierName: supplier?.name || 'Unknown',
      totalAmount,
      createdBy: profile?.uid,
      createdAt: new Date(poForm.createdAt).toISOString(),
      companyId: profile?.companyId || ''
    }),
  });
};

export const updatePurchaseOrder = async (
  orderId: string, 
  poForm: any, 
  suppliers: Supplier[]
) => {
  const totalAmount = poForm.items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.quantity * item.price), 0);
  const supplier = suppliers.find(s => s.id === poForm.supplierId);
  
  return await apiFetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...poForm,
      supplierName: supplier?.name || 'Unknown',
      totalAmount,
      createdAt: new Date(poForm.createdAt).toISOString()
    }),
  });
};

export const createSupplier = async (supplierForm: any, profile: UserProfile | null) => {
  return await apiFetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    body: JSON.stringify({
      ...supplierForm,
      companyId: profile?.companyId || ''
    }),
  });
};

export const updateOrderStatus = async (orderId: string, status: PurchaseOrder['status']) => {
  return await apiFetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};
