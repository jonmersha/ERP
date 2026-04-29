
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy as fsOrderBy, 
  limit as fsLimit,
  addDoc as fsAddDoc,
  updateDoc as fsUpdateDoc,
  deleteDoc as fsDeleteDoc,
  doc as fsDoc,
  onSnapshot as fsOnSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export interface FetchOptions {
  orderByField?: string;
  orderDir?: 'asc' | 'desc';
  limitCount?: number;
}

class ApiService {
  async fetchCollection<T>(collectionName: string, companyId: string, options?: FetchOptions): Promise<T[]> {
    let q = query(collection(db, collectionName), where('companyId', '==', companyId));
    if (options?.orderByField) {
      q = query(q, fsOrderBy(options.orderByField, options.orderDir || 'asc'));
    }
    if (options?.limitCount) {
      q = query(q, fsLimit(options.limitCount));
    }
    
    try {
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as T));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionName);
      return []; // fallback if not thrown
    }
  }

  subscribeToCollection<T>(collectionName: string, companyId: string, callback: (data: T[]) => void) {
    const q = query(collection(db, collectionName), where('companyId', '==', companyId));
    return fsOnSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as T)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionName);
    });
  }

  async addDocument(collectionName: string, data: any) {
    try {
      return await fsAddDoc(collection(db, collectionName), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionName);
    }
  }

  async updateDocument(collectionName: string, docId: string, data: any) {
    try {
      return await fsUpdateDoc(fsDoc(db, collectionName, docId), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${collectionName}/${docId}`);
    }
  }

  async deleteDocument(collectionName: string, docId: string) {
    try {
      return await fsDeleteDoc(fsDoc(db, collectionName, docId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${docId}`);
    }
  }
}

export const apiService = new ApiService();
