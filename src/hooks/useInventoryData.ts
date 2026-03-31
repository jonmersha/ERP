import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { InventoryItem, Factory, Warehouse, RawMaterial, Product, PurchaseOrder, SalesOrder, GRN, DeliveryNote } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

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

    const companyFilter = where('companyId', '==', profile.companyId);

    let loadedCount = 0;
    const totalCollections = 9;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === totalCollections) {
        setLoading(false);
      }
    };

    const unsubInv = onSnapshot(query(collection(db, 'inventory'), companyFilter), (snap) => {
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryItem)));
      checkLoaded();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'inventory'));

    const unsubFactories = onSnapshot(query(collection(db, 'factories'), companyFilter), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
      checkLoaded();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'factories'));

    const unsubWarehouses = onSnapshot(query(collection(db, 'warehouses'), companyFilter), (snap) => {
      setWarehouses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse)));
      checkLoaded();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'warehouses'));

    const unsubMaterials = onSnapshot(query(collection(db, 'rawMaterials'), companyFilter), (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RawMaterial)));
      checkLoaded();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'rawMaterials'));

    const unsubProducts = onSnapshot(query(collection(db, 'products'), companyFilter), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      checkLoaded();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));
    
    const unsubPOs = onSnapshot(
      query(collection(db, 'purchaseOrders'), companyFilter, where('status', 'in', ['approved', 'shipped'])),
      (snap) => {
        setPendingPOs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PurchaseOrder)));
        checkLoaded();
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'purchaseOrders')
    );

    const unsubSOs = onSnapshot(
      query(collection(db, 'salesOrders'), companyFilter, where('status', 'in', ['paid', 'ready_to_ship'])),
      (snap) => {
        setPendingSOs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SalesOrder)));
        checkLoaded();
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'salesOrders')
    );

    const unsubGrns = onSnapshot(query(collection(db, 'grns'), companyFilter, orderBy('receivedAt', 'desc')), (snap) => {
      setGrns(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GRN)));
      checkLoaded();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'grns'));

    const unsubDns = onSnapshot(query(collection(db, 'deliveryNotes'), companyFilter, orderBy('shippedAt', 'desc')), (snap) => {
      setDeliveryNotes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DeliveryNote)));
      checkLoaded();
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'deliveryNotes'));

    return () => {
      unsubInv();
      unsubFactories();
      unsubWarehouses();
      unsubMaterials();
      unsubProducts();
      unsubPOs();
      unsubSOs();
      unsubGrns();
      unsubDns();
    };
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
