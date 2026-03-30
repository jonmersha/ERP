import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Supplier, PurchaseOrder, RawMaterial, Factory, Warehouse } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export const useProcurementData = () => {
  const { profile } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const companyFilter = where('companyId', '==', profile.companyId);

    const unsubSuppliers = onSnapshot(query(collection(db, 'suppliers'), companyFilter), (snap) => {
      setSuppliers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'suppliers'));

    const unsubOrders = onSnapshot(query(collection(db, 'purchaseOrders'), companyFilter, orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'purchaseOrders'));

    const unsubMaterials = onSnapshot(query(collection(db, 'rawMaterials'), companyFilter), (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RawMaterial)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'rawMaterials'));

    const unsubFactories = onSnapshot(query(collection(db, 'factories'), companyFilter), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'factories'));

    const unsubWarehouses = onSnapshot(query(collection(db, 'warehouses'), companyFilter), (snap) => {
      setWarehouses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'warehouses'));

    return () => {
      unsubSuppliers();
      unsubOrders();
      unsubMaterials();
      unsubFactories();
      unsubWarehouses();
    };
  }, [profile?.companyId]);

  return {
    suppliers,
    orders,
    materials,
    factories,
    warehouses,
    loading
  };
};
