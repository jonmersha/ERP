import { useState, useEffect } from 'react';
import { SalesOrder, Product, SalesOutlet } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

export const useSalesData = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [outlets, setOutlets] = useState<SalesOutlet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const fetchData = async () => {
      try {
        const [ordersData, productsData, outletsData] = await Promise.all([
          apiFetch('/api/sales/orders?orderBy=createdAt&orderDir=desc'),
          apiFetch('/api/products'),
          apiFetch('/api/sales/outlets')
        ]);

        if (Array.isArray(ordersData)) setOrders(ordersData);
        if (Array.isArray(productsData)) setProducts(productsData);
        if (Array.isArray(outletsData)) setOutlets(outletsData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [profile?.companyId]);

  return {
    orders,
    products,
    outlets,
    loading
  };
};
