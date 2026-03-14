import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Supplier, PurchaseOrder, RawMaterial, Factory, Warehouse } from '../types';

export const useProcurementData = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubSuppliers = onSnapshot(collection(db, 'suppliers'), (snap) => {
      setSuppliers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
    });
    const unsubOrders = onSnapshot(query(collection(db, 'purchaseOrders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder)));
    });
    const unsubMaterials = onSnapshot(collection(db, 'rawMaterials'), (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RawMaterial)));
    });
    const unsubFactories = onSnapshot(collection(db, 'factories'), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
    });
    const unsubWarehouses = onSnapshot(collection(db, 'warehouses'), (snap) => {
      setWarehouses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse)));
      setLoading(false);
    });

    return () => {
      unsubSuppliers();
      unsubOrders();
      unsubMaterials();
      unsubFactories();
      unsubWarehouses();
    };
  }, []);

  return {
    suppliers,
    orders,
    materials,
    factories,
    warehouses,
    loading
  };
};
