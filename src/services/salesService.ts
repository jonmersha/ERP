import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { SalesOrder, SalesOrderItem, UserProfile, SalesOutlet } from '../types';

export const createSalesOrder = async (
  soForm: any, 
  outlets: SalesOutlet[], 
  profile: UserProfile | null
) => {
  const totalAmount = soForm.items.reduce((sum: number, item: SalesOrderItem) => sum + (item.quantity * item.price), 0);
  const outlet = outlets.find(o => o.id === soForm.outletId);
  
  await addDoc(collection(db, 'salesOrders'), {
    ...soForm,
    outletName: outlet?.name || 'Unknown',
    totalAmount,
    createdBy: profile?.uid,
    createdAt: new Date(soForm.createdAt).toISOString()
  });
};

export const updateSalesOrder = async (
  orderId: string, 
  soForm: any, 
  outlets: SalesOutlet[]
) => {
  const totalAmount = soForm.items.reduce((sum: number, item: SalesOrderItem) => sum + (item.quantity * item.price), 0);
  const outlet = outlets.find(o => o.id === soForm.outletId);
  
  await updateDoc(doc(db, 'salesOrders', orderId), {
    ...soForm,
    outletName: outlet?.name || 'Unknown',
    totalAmount,
    createdAt: new Date(soForm.createdAt).toISOString()
  });
};

export const updateSalesOrderStatus = async (orderId: string, status: SalesOrder['status']) => {
  await updateDoc(doc(db, 'salesOrders', orderId), { status });
};
