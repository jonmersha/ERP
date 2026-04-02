import { useState, useEffect } from 'react';
import { Factory, Warehouse, SalesOutlet, RawMaterial, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

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

    const fetchData = async () => {
      try {
        const [factoriesData, warehousesData, outletsData, materialsData, productsData] = await Promise.all([
          apiFetch('/api/core/factories'),
          apiFetch('/api/core/warehouses'),
          apiFetch('/api/sales/outlets'),
          apiFetch('/api/products/raw-materials'),
          apiFetch('/api/products')
        ]);

        if (Array.isArray(factoriesData)) setFactories(factoriesData);
        if (Array.isArray(warehousesData)) setWarehouses(warehousesData);
        if (Array.isArray(outletsData)) setOutlets(outletsData);
        if (Array.isArray(materialsData)) setMaterials(materialsData);
        if (Array.isArray(productsData)) setProducts(productsData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
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
