import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { SalesOrder, Product, SalesOutlet } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export const useSalesData = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [outlets, setOutlets] = useState<SalesOutlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const companyFilter = where('companyId', '==', profile.companyId);

    const unsubOrders = onSnapshot(query(collection(db, 'salesOrders'), companyFilter, orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'salesOrders'));

    const unsubProducts = onSnapshot(query(collection(db, 'products'), companyFilter), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    const unsubOutlets = onSnapshot(query(collection(db, 'outlets'), companyFilter), (snap) => {
      setOutlets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOutlet)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'outlets'));

    return () => {
      unsubOrders();
      unsubProducts();
      unsubOutlets();
    };
  }, [profile?.companyId]);

  return {
    orders,
    products,
    outlets,
    loading
  };
};
