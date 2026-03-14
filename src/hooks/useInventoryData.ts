import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { InventoryItem, Factory, Warehouse, RawMaterial, Product, PurchaseOrder, SalesOrder, GRN, DeliveryNote } from '../types';

export const useInventoryData = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrder[]>([]);
  const [pendingSOs, setPendingSOs] = useState<SalesOrder[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, 'inventory'), (snap) => {
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
    });
    const unsubFactories = onSnapshot(collection(db, 'factories'), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
    });
    const unsubWarehouses = onSnapshot(collection(db, 'warehouses'), (snap) => {
      setWarehouses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse)));
    });
    const unsubMaterials = onSnapshot(collection(db, 'rawMaterials'), (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RawMaterial)));
    });
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    
    const unsubPOs = onSnapshot(
      query(collection(db, 'purchaseOrders'), where('status', 'in', ['approved', 'shipped'])),
      (snap) => {
        setPendingPOs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder)));
      }
    );

    const unsubSOs = onSnapshot(
      query(collection(db, 'salesOrders'), where('status', 'in', ['paid', 'ready_to_ship'])),
      (snap) => {
        setPendingSOs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder)));
      }
    );

    const unsubGrns = onSnapshot(query(collection(db, 'grns'), orderBy('receivedAt', 'desc')), (snap) => {
      setGrns(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GRN)));
    });

    const unsubDns = onSnapshot(query(collection(db, 'deliveryNotes'), orderBy('shippedAt', 'desc')), (snap) => {
      setDeliveryNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryNote)));
      setLoading(false);
    });

    return () => {
      unsubInv();
      unsubFactories();
      unsubWarehouses();
      unsubMaterials();
      unsubProducts();
      unsubPOs();
      unsubSOs();
      unsubGrns();
      unsubDns();
    };
  }, []);

  return {
    inventory,
    factories,
    warehouses,
    materials,
    products,
    pendingPOs,
    pendingSOs,
    grns,
    deliveryNotes,
    loading
  };
};
