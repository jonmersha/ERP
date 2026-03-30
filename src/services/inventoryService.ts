import { collection, doc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { PurchaseOrder, SalesOrder, GRN, DeliveryNote, UserProfile } from '../types';

export const receivePurchaseOrder = async (
  selectedPO: PurchaseOrder, 
  warehouseId: string, 
  notes: string, 
  profile: UserProfile | null
) => {
  const batch = writeBatch(db);
  const grnRef = doc(collection(db, 'grns'));
  
  const grnData: GRN = {
    id: grnRef.id,
    purchaseOrderId: selectedPO.id,
    warehouseId: warehouseId,
    receivedBy: profile?.uid || '',
    receivedAt: new Date().toISOString(),
    items: (selectedPO.items || []).map(item => ({
      itemId: item.itemId,
      quantityReceived: item.quantity
    })),
    notes: notes,
    companyId: profile?.companyId || ''
  };
  batch.set(grnRef, grnData);

  const items = selectedPO.items || [];
  for (const item of items) {
    const inventoryQuery = query(
      collection(db, 'inventory'),
      where('companyId', '==', profile?.companyId),
      where('unitId', '==', warehouseId),
      where('itemId', '==', item.itemId),
      where('itemType', '==', 'raw')
    );
    const inventorySnap = await getDocs(inventoryQuery);

    if (!inventorySnap.empty) {
      const invDoc = inventorySnap.docs[0];
      batch.update(invDoc.ref, {
        quantity: invDoc.data().quantity + item.quantity
      });
    } else {
      const newInvRef = doc(collection(db, 'inventory'));
      batch.set(newInvRef, {
        unitId: warehouseId,
        itemId: item.itemId,
        itemType: 'raw',
        quantity: item.quantity,
        createdAt: new Date().toISOString(),
        companyId: profile?.companyId || ''
      });
    }
  }

  batch.update(doc(db, 'purchaseOrders', selectedPO.id), { status: 'received' });
  await batch.commit();
};

export const transferProductionToWarehouse = async (
  productId: string,
  quantity: number,
  warehouseId: string,
  profile: UserProfile | null
) => {
  const batch = writeBatch(db);
  
  const inventoryQuery = query(
    collection(db, 'inventory'),
    where('companyId', '==', profile?.companyId),
    where('unitId', '==', warehouseId),
    where('itemId', '==', productId),
    where('itemType', '==', 'product')
  );
  const inventorySnap = await getDocs(inventoryQuery);

  if (!inventorySnap.empty) {
    const invDoc = inventorySnap.docs[0];
    batch.update(invDoc.ref, {
      quantity: invDoc.data().quantity + quantity
    });
  } else {
    const newInvRef = doc(collection(db, 'inventory'));
    batch.set(newInvRef, {
      unitId: warehouseId,
      itemId: productId,
      itemType: 'product',
      quantity: quantity,
      createdAt: new Date().toISOString(),
      companyId: profile?.companyId || ''
    });
  }

  await batch.commit();
};

export const shipSalesOrder = async (
  selectedSO: SalesOrder, 
  warehouseId: string, 
  notes: string, 
  profile: UserProfile | null
) => {
  const batch = writeBatch(db);
  const dnRef = doc(collection(db, 'deliveryNotes'));
  
  const dnData: DeliveryNote = {
    id: dnRef.id,
    salesOrderId: selectedSO.id,
    warehouseId: warehouseId,
    shippedBy: profile?.uid || '',
    shippedAt: new Date().toISOString(),
    items: (selectedSO.items || []).map(item => ({
      productId: item.productId,
      quantityShipped: item.quantity
    })),
    notes: notes,
    companyId: profile?.companyId || ''
  };
  batch.set(dnRef, dnData);

  const items = selectedSO.items || [];
  for (const item of items) {
    const inventoryQuery = query(
      collection(db, 'inventory'),
      where('companyId', '==', profile?.companyId),
      where('unitId', '==', warehouseId),
      where('itemId', '==', item.productId),
      where('itemType', '==', 'product')
    );
    const inventorySnap = await getDocs(inventoryQuery);

    if (!inventorySnap.empty) {
      const invDoc = inventorySnap.docs[0];
      const currentQty = invDoc.data().quantity;
      if (currentQty < item.quantity) {
         throw new Error(`Insufficient stock for ${item.productName}`);
      }
      batch.update(invDoc.ref, {
        quantity: currentQty - item.quantity
      });
    } else {
      // Check if it exists in another warehouse
      const anyInventoryQuery = query(
        collection(db, 'inventory'),
        where('companyId', '==', profile?.companyId),
        where('itemId', '==', item.productId),
        where('itemType', '==', 'product')
      );
      const anyInventorySnap = await getDocs(anyInventoryQuery);
      
      if (!anyInventorySnap.empty) {
          throw new Error(`Stock for ${item.productName} found in other warehouses, but not in the selected one.`);
      } else {
          throw new Error(`No stock found for ${item.productName} anywhere.`);
      }
    }
  }

  batch.update(doc(db, 'salesOrders', selectedSO.id), { status: 'shipped' });
  await batch.commit();
};
