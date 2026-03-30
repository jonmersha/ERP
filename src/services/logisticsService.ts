import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Shipment } from '../types';

const COLLECTION = 'shipments';

export const getShipments = async (companyId: string): Promise<Shipment[]> => {
  const q = query(collection(db, COLLECTION), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shipment));
};

export const addShipment = (shipment: Omit<Shipment, 'id'>) => addDoc(collection(db, COLLECTION), shipment);
export const updateShipment = (id: string, shipment: Partial<Shipment>) => updateDoc(doc(db, COLLECTION, id), shipment);
export const deleteShipment = (id: string) => deleteDoc(doc(db, COLLECTION, id));
