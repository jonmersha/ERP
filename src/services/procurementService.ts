import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Supplier, PurchaseOrder, PurchaseOrderItem, UserProfile } from '../types';

export const createPurchaseOrder = async (
  poForm: any, 
  suppliers: Supplier[], 
  profile: UserProfile | null
) => {
  const totalAmount = poForm.items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.quantity * item.price), 0);
  const supplier = suppliers.find(s => s.id === poForm.supplierId);
  
  await addDoc(collection(db, 'purchaseOrders'), {
    ...poForm,
    supplierName: supplier?.name || 'Unknown',
    totalAmount,
    createdBy: profile?.uid,
    createdAt: new Date(poForm.createdAt).toISOString(),
    companyId: profile?.companyId || ''
  });
};

export const updatePurchaseOrder = async (
  orderId: string, 
  poForm: any, 
  suppliers: Supplier[]
) => {
  const totalAmount = poForm.items.reduce((sum: number, item: PurchaseOrderItem) => sum + (item.quantity * item.price), 0);
  const supplier = suppliers.find(s => s.id === poForm.supplierId);
  
  await updateDoc(doc(db, 'purchaseOrders', orderId), {
    ...poForm,
    supplierName: supplier?.name || 'Unknown',
    totalAmount,
    createdAt: new Date(poForm.createdAt).toISOString()
  });
};

export const createSupplier = async (supplierForm: any, profile: UserProfile | null) => {
  await addDoc(collection(db, 'suppliers'), {
    ...supplierForm,
    companyId: profile?.companyId || ''
  });
};

export const updateOrderStatus = async (orderId: string, status: PurchaseOrder['status']) => {
  await updateDoc(doc(db, 'purchaseOrders', orderId), { status });
};
