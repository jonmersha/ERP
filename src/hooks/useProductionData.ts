import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Factory, ProductionPlan, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export const useProductionData = () => {
  const { profile } = useAuth();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const companyFilter = where('companyId', '==', profile.companyId);

    const unsubFactories = onSnapshot(query(collection(db, 'factories'), companyFilter), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'factories'));

    const unsubPlans = onSnapshot(query(collection(db, 'productionPlans'), companyFilter, orderBy('startDate', 'desc')), (snap) => {
      setPlans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionPlan)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'productionPlans'));

    const unsubProducts = onSnapshot(query(collection(db, 'products'), companyFilter), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    return () => {
      unsubFactories();
      unsubPlans();
      unsubProducts();
    };
  }, [profile?.companyId]);

  return {
    factories,
    plans,
    products,
    loading
  };
};
