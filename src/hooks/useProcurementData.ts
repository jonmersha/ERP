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

    const fetchData = async () => {
      try {
        const companyId = profile.companyId;
        const [suppliersRes, ordersRes, materialsRes, factoriesRes, warehousesRes] = await Promise.all([
          fetch(`/api/procurement/suppliers?companyId=${companyId}`),
          fetch(`/api/procurement/purchase-orders?companyId=${companyId}&orderBy=createdAt&orderDir=desc`),
          fetch(`/api/products/raw-materials?companyId=${companyId}`),
          fetch(`/api/core/factories?companyId=${companyId}`),
          fetch(`/api/core/warehouses?companyId=${companyId}`)
        ]);

        const [suppliersData, ordersData, materialsData, factoriesData, warehousesData] = await Promise.all([
          suppliersRes.json(),
          ordersRes.json(),
          materialsRes.json(),
          factoriesRes.json(),
          warehousesRes.json()
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
