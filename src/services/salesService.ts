import { SalesOrder, SalesOrderItem, UserProfile, SalesOutlet } from '../types';

const API_BASE = '/api/sales';

export const createSalesOrder = async (
  soForm: any, 
  outlets: SalesOutlet[], 
  profile: UserProfile | null
) => {
  const totalAmount = soForm.items.reduce((sum: number, item: SalesOrderItem) => sum + (item.quantity * item.price), 0);
  const outlet = outlets.find(o => o.id === soForm.outletId);
  
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...soForm,
      outletName: outlet?.name || 'Unknown',
      totalAmount,
      createdBy: profile?.uid,
      createdAt: new Date(soForm.createdAt).toISOString(),
      companyId: profile?.companyId || ''
    }),
  });
  if (!response.ok) throw new Error('Failed to create sales order');
  return await response.json();
};

export const updateSalesOrder = async (
  orderId: string, 
  soForm: any, 
  outlets: SalesOutlet[]
) => {
  const totalAmount = soForm.items.reduce((sum: number, item: SalesOrderItem) => sum + (item.quantity * item.price), 0);
  const outlet = outlets.find(o => o.id === soForm.outletId);
  
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...soForm,
      outletName: outlet?.name || 'Unknown',
      totalAmount,
      createdAt: new Date(soForm.createdAt).toISOString()
    }),
  });
  if (!response.ok) throw new Error('Failed to update sales order');
  return await response.json();
};

export const updateSalesOrderStatus = async (orderId: string, status: SalesOrder['status']) => {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update sales order status');
  return await response.json();
};
