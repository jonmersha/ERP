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

    const fetchData = async () => {
      try {
        const companyId = profile.companyId;
        const [factoriesRes, runsRes, plansRes, productsRes, recipesRes] = await Promise.all([
          fetch(`/api/core/factories?companyId=${companyId}`),
          fetch(`/api/production/runs?companyId=${companyId}&orderBy=startDate&orderDir=desc`),
          fetch(`/api/plans/production?companyId=${companyId}`),
          fetch(`/api/products?companyId=${companyId}`),
          fetch(`/api/production/recipes?companyId=${companyId}`)
        ]);

        const [factoriesData, runsData, plansData, productsData, recipesData] = await Promise.all([
          factoriesRes.json(),
          runsRes.json(),
          plansRes.json(),
          productsRes.json(),
          recipesRes.json()
        ]);

        if (Array.isArray(factoriesData)) setFactories(factoriesData);
        if (Array.isArray(runsData)) setRuns(runsData);
        if (Array.isArray(plansData)) setPlans(plansData);
        if (Array.isArray(productsData)) setProducts(productsData);
        if (Array.isArray(recipesData)) setRecipes(recipesData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching production data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
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
