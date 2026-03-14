import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Factory, ProductionPlan, Product } from '../types';

export const useProductionData = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubFactories = onSnapshot(collection(db, 'factories'), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
    });
    const unsubPlans = onSnapshot(query(collection(db, 'productionPlans'), orderBy('startDate', 'desc')), (snap) => {
      setPlans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionPlan)));
    });
    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setLoading(false);
    });

    return () => {
      unsubFactories();
      unsubPlans();
      unsubProducts();
    };
  }, []);

  return {
    factories,
    plans,
    products,
    loading
  };
};
