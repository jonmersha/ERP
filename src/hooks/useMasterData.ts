import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Factory, Warehouse, SalesOutlet, RawMaterial, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export const useMasterData = () => {
  const { profile } = useAuth();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [outlets, setOutlets] = useState<SalesOutlet[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const companyFilter = where('companyId', '==', profile.companyId);

    const unsubFactories = onSnapshot(query(collection(db, 'factories'), companyFilter), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'factories'));

    const unsubWarehouses = onSnapshot(query(collection(db, 'warehouses'), companyFilter), (snap) => {
      setWarehouses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'warehouses'));

    const unsubOutlets = onSnapshot(query(collection(db, 'outlets'), companyFilter), (snap) => {
      setOutlets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOutlet)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'outlets'));

    const unsubMaterials = onSnapshot(query(collection(db, 'rawMaterials'), companyFilter), (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RawMaterial)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'rawMaterials'));

    const unsubProducts = onSnapshot(query(collection(db, 'products'), companyFilter), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    return () => {
      unsubFactories();
      unsubWarehouses();
      unsubOutlets();
      unsubMaterials();
      unsubProducts();
    };
  }, [profile?.companyId]);

  return {
    factories,
    warehouses,
    outlets,
    materials,
    products,
    loading
  };
};
