
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

  private async handleFetch(url: string, options: RequestInit) {
    console.log(`Fetching: ${url}`, options);
    try {
      const response = await fetch(url, options);
      console.log(`Response status for ${url}:`, response.status);
      if (!response.ok) {
        const text = await response.text();
        console.error(`Error details for ${url}:`, text);
        throw new Error(`Failed with status ${response.status}: ${text}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Catch error for ${url}:`, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    return this.handleFetch(`${this.getBaseUrl()}/${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    return this.handleFetch(`${this.getBaseUrl()}/${endpoint}`, {
      method: 'GET',
      headers,
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getHeaders();
    return this.handleFetch(`${this.getBaseUrl()}/${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    return this.handleFetch(`${this.getBaseUrl()}/${endpoint}`, {
      method: 'DELETE',
      headers,
    });
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
