import { collection, getDocs, query, where, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchCollection = async (
  collectionName: string, 
  companyId: string, 
  options?: { orderByField?: string, orderDir?: 'asc' | 'desc', limitCount?: number }
) => {
  let q = query(collection(db, collectionName), where('companyId', '==', companyId));
  if (options?.orderByField) {
    q = query(q, orderBy(options.orderByField, options.orderDir || 'asc'));
  }
  if (options?.limitCount) {
    q = query(q, firestoreLimit(options.limitCount));
  }
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error(`Error fetching collection ${collectionName}:`, err);
    throw err;
  }
};
