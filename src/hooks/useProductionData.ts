import { useState, useEffect } from 'react';
import { Factory, Product, ProductionRun, Recipe, ProductionPlan } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

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
        const [factoriesData, runsData, plansData, productsData, recipesData] = await Promise.all([
          apiFetch('/api/core/factories'),
          apiFetch('/api/production/runs?orderBy=startDate&orderDir=desc'),
          apiFetch('/api/plans/production'),
          apiFetch('/api/products'),
          apiFetch('/api/production/recipes')
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
