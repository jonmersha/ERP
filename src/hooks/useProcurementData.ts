import { useState, useEffect } from 'react';
import { Supplier, PurchaseOrder, RawMaterial, Factory, Warehouse } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

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

    const fetchData = async () => {
      try {
        const [suppliersData, ordersData, materialsData, factoriesData, warehousesData] = await Promise.all([
          apiFetch('/api/procurement/suppliers'),
          apiFetch('/api/procurement/orders?orderBy=createdAt&orderDir=desc'),
          apiFetch('/api/products/raw-materials'),
          apiFetch('/api/core/factories'),
          apiFetch('/api/core/warehouses')
        ]);

        if (Array.isArray(suppliersData)) setSuppliers(suppliersData);
        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(materialsData)) setMaterials(materialsData);
        if (Array.isArray(factoriesData)) setFactories(factoriesData);
        if (Array.isArray(warehousesData)) setWarehouses(warehousesData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching procurement data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
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
