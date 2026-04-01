import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Factory, Product, ProductionRun, Recipe, ProductionPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export const useProductionData = () => {
  const { profile } = useAuth();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [runs, setRuns] = useState<ProductionRun[]>([]);
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const companyFilter = where('companyId', '==', profile.companyId);

    const unsubFactories = onSnapshot(query(collection(db, 'factories'), companyFilter), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'factories'));

    const unsubRuns = onSnapshot(query(collection(db, 'productionRuns'), companyFilter, orderBy('startDate', 'desc')), (snap) => {
      setRuns(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionRun)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'productionRuns'));

    const unsubPlans = onSnapshot(query(collection(db, 'productionPlans'), companyFilter), (snap) => {
      setPlans(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionPlan)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'productionPlans'));

    const unsubProducts = onSnapshot(query(collection(db, 'products'), companyFilter), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    const unsubRecipes = onSnapshot(query(collection(db, 'recipes'), companyFilter), (snap) => {
      setRecipes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'recipes'));

    return () => {
      unsubFactories();
      unsubRuns();
      unsubPlans();
      unsubProducts();
      unsubRecipes();
    };
  }, [profile?.companyId]);

  return {
    factories,
    runs,
    plans,
    products,
    recipes,
    loading
  };
};
