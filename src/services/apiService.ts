
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
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export interface FetchOptions {
  orderByField?: string;
  orderDir?: 'asc' | 'desc';
  limitCount?: number;
}

class ApiService {
  private getBaseUrl() {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
  }

  private async getHeaders() {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${this.getBaseUrl()}/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to post');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${this.getBaseUrl()}/${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to put');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async fetchCollection<T>(collectionName: string, companyId: string, options?: FetchOptions): Promise<T[]> {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${this.getBaseUrl()}/${collectionName}?companyId=${companyId}`, {
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async addDocument(collectionName: string, data: any) {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${this.getBaseUrl()}/${collectionName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async updateDocument(collectionName: string, docId: string, data: any) {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${this.getBaseUrl()}/${collectionName}/${docId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  async deleteDocument(collectionName: string, docId: string) {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${this.getBaseUrl()}/${collectionName}/${docId}`, {
        method: 'DELETE',
        headers,
      });
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }
}

export const apiService = new ApiService();
