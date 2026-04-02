import { SalesOrder, SalesOrderItem, UserProfile, SalesOutlet } from '../types';
import { apiFetch } from '../utils/api';

const API_BASE = '/api/sales';

export const createSalesOrder = async (
  soForm: any, 
  outlets: SalesOutlet[], 
  profile: UserProfile | null
) => {
  const totalAmount = soForm.items.reduce((sum: number, item: SalesOrderItem) => sum + (item.quantity * item.price), 0);
  const outlet = outlets.find(o => o.id === soForm.outletId);
  
  return await apiFetch(`${API_BASE}/orders`, {
    method: 'POST',
    body: JSON.stringify({
      ...soForm,
      outletName: outlet?.name || 'Unknown',
      totalAmount,
      createdBy: profile?.uid,
      createdAt: new Date(soForm.createdAt).toISOString(),
      companyId: profile?.companyId || ''
    }),
  });
};

export const updateSalesOrder = async (
  orderId: string, 
  soForm: any, 
  outlets: SalesOutlet[]
) => {
  const totalAmount = soForm.items.reduce((sum: number, item: SalesOrderItem) => sum + (item.quantity * item.price), 0);
  const outlet = outlets.find(o => o.id === soForm.outletId);
  
  return await apiFetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...soForm,
      outletName: outlet?.name || 'Unknown',
      totalAmount,
      createdAt: new Date(soForm.createdAt).toISOString()
    }),
  });
};

export const updateSalesOrderStatus = async (orderId: string, status: SalesOrder['status']) => {
  return await apiFetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
};
