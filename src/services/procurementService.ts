import { Supplier, PurchaseOrder, PurchaseOrderItem, UserProfile } from '../types';

const API_BASE = '/api/procurement';

export const createPurchaseOrder = async (
  poForm: any, 
  suppliers: Supplier[], 
  profile: UserProfile | null
) => {
  const totalAmount = poForm.items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.quantity * item.price), 0);
  const supplier = suppliers.find(s => s.id === poForm.supplierId);
  
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...poForm,
      supplierName: supplier?.name || 'Unknown',
      totalAmount,
      createdBy: profile?.uid,
      createdAt: new Date(poForm.createdAt).toISOString(),
      companyId: profile?.companyId || ''
    }),
  });
  if (!response.ok) throw new Error('Failed to create purchase order');
  return await response.json();
};

export const updatePurchaseOrder = async (
  orderId: string, 
  poForm: any, 
  suppliers: Supplier[]
) => {
  const totalAmount = poForm.items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.quantity * item.price), 0);
  const supplier = suppliers.find(s => s.id === poForm.supplierId);
  
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...poForm,
      supplierName: supplier?.name || 'Unknown',
      totalAmount,
      createdAt: new Date(poForm.createdAt).toISOString()
    }),
  });
  if (!response.ok) throw new Error('Failed to update purchase order');
  return await response.json();
};

export const createSupplier = async (supplierForm: any, profile: UserProfile | null) => {
  const response = await fetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...supplierForm,
      companyId: profile?.companyId || ''
    }),
  });
  if (!response.ok) throw new Error('Failed to create supplier');
  return await response.json();
};

export const updateOrderStatus = async (orderId: string, status: PurchaseOrder['status']) => {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return await response.json();
};
