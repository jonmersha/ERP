import { useState, useEffect } from 'react';
import { InventoryItem, Factory, Warehouse, RawMaterial, Product, PurchaseOrder, SalesOrder, GRN, DeliveryNote } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

export const useInventoryData = () => {
  const { profile } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PurchaseOrder[]>([]);
  const [pendingSOs, setPendingSOs] = useState<SalesOrder[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const fetchData = async () => {
      try {
        const [
          invData, 
          factoriesData, 
          warehousesData, 
          materialsData, 
          productsData, 
          poData, 
          soData, 
          grnsData, 
          dnsData
        ] = await Promise.all([
          apiFetch('/api/inventory'),
          apiFetch('/api/core/factories'),
          apiFetch('/api/core/warehouses'),
          apiFetch('/api/products/raw-materials'),
          apiFetch('/api/products'),
          apiFetch('/api/procurement/orders'),
          apiFetch('/api/sales/orders'),
          apiFetch('/api/inventory/grns'),
          apiFetch('/api/inventory/delivery-notes')
        ]);

        if (Array.isArray(invData)) setInventory(invData);
        if (Array.isArray(factoriesData)) setFactories(factoriesData);
        if (Array.isArray(warehousesData)) setWarehouses(warehousesData);
        if (Array.isArray(materialsData)) setMaterials(materialsData);
        if (Array.isArray(productsData)) setProducts(productsData);
        if (Array.isArray(poData)) {
          setPendingPOs(poData.filter((po: any) => ['approved', 'shipped'].includes(po.status)));
        }
        if (Array.isArray(soData)) {
          setPendingSOs(soData.filter((so: any) => ['paid', 'ready_to_ship'].includes(so.status)));
        }
        if (Array.isArray(grnsData)) setGrns(grnsData);
        if (Array.isArray(dnsData)) setDeliveryNotes(dnsData);

      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [profile?.companyId]);

  return {
    inventory,
    factories,
    warehouses,
    materials,
    products,
    pendingPOs,
    pendingSOs,
    grns,
    deliveryNotes,
    loading
  };
};
