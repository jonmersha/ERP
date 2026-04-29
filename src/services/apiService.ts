
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

// This service acts as a proxy. 
// Initially, it uses Firebase. 
// Later, it will call our Express Backend when we switch to "SQL Mode".

export interface FetchOptions {
  orderByField?: string;
  orderDir?: 'asc' | 'desc';
  limitCount?: number;
}

class ApiService {
  private mode: 'firebase' | 'sql' = 'firebase';

  setMode(mode: 'firebase' | 'sql') {
    this.mode = mode;
    localStorage.setItem('app_data_mode', mode);
  }

  getMode() {
    return (localStorage.getItem('app_data_mode') as 'firebase' | 'sql') || 'firebase';
  }

  async fetchCollection<T>(collectionName: string, companyId: string, options?: FetchOptions): Promise<T[]> {
    if (this.getMode() === 'sql') {
      const resp = await fetch(`/api/data/${collectionName}?companyId=${companyId}`);
      if (!resp.ok) throw new Error('API Error');
      return resp.json();
    }

    // Firebase Implementation
    let q = query(collection(db, collectionName), where('companyId', '==', companyId));
    if (options?.orderByField) {
      q = query(q, fsOrderBy(options.orderByField, options.orderDir || 'asc'));
    }
    if (options?.limitCount) {
      q = query(q, fsLimit(options.limitCount));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as T));
  }

  // Real-time listener placeholder
  subscribeToCollection<T>(collectionName: string, companyId: string, callback: (data: T[]) => void) {
    if (this.getMode() === 'sql') {
      // For SQL, we might use polling or WebSockets. 
      // For now, let's just do a single fetch for the demo.
      this.fetchCollection<T>(collectionName, companyId).then(callback);
      const interval = setInterval(() => {
        this.fetchCollection<T>(collectionName, companyId).then(callback);
      }, 5000);
      return () => clearInterval(interval);
    }

    const q = query(collection(db, collectionName), where('companyId', '==', companyId));
    return fsOnSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as T)));
    });
  }

  async addDocument(collectionName: string, data: any) {
    if (this.getMode() === 'sql') {
       const resp = await fetch(`/api/data/${collectionName}`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
       return resp.json();
    }
    return fsAddDoc(collection(db, collectionName), data);
  }

  async updateDocument(collectionName: string, docId: string, data: any) {
    if (this.getMode() === 'sql') {
       const resp = await fetch(`/api/data/${collectionName}/${docId}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
       return resp.json();
    }
    return fsUpdateDoc(fsDoc(db, collectionName, docId), data);
  }
}

export const apiService = new ApiService();
