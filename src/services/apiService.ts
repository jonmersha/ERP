
export interface FetchOptions {
  orderByField?: string;
  orderDir?: 'asc' | 'desc';
  limitCount?: number;
}

class ApiService {
  private activeBackend: 'firebase' | 'sql' = 'firebase';

  constructor() {}

  setMode(mode: 'firebase' | 'sql') {
    this.activeBackend = mode;
  }

  getMode() {
    return this.activeBackend;
  }

  async fetchCollection<T>(collectionName: string, companyId: string, options?: FetchOptions): Promise<T[]> {
    try {
      const params = new URLSearchParams({ companyId });
      if (options?.orderByField) params.append('orderByField', options.orderByField);
      if (options?.orderDir) params.append('orderDir', options.orderDir);
      if (options?.limitCount) params.append('limitCount', String(options.limitCount));

      const resp = await fetch(`/api/data/${collectionName}?${params.toString()}`);
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        console.error(`API Error on ${collectionName}:`, resp.status, body);
        throw new Error(`API Error: ${resp.status} - ${body.details || body.error || 'Unknown error'}`);
      }
      return resp.json();
    } catch (err) {
      console.error(`Fetch failure on ${collectionName}:`, err);
      throw err;
    }
  }

  subscribeToCollection<T>(collectionName: string, companyId: string, callback: (data: T[]) => void) {
    // Standard polling for now as backend doesn't support WebSockets yet
    this.fetchCollection<T>(collectionName, companyId).then(callback);
    const interval = setInterval(() => {
      this.fetchCollection<T>(collectionName, companyId).then(callback);
    }, 5000);
    return () => clearInterval(interval);
  }

  async addDocument(collectionName: string, data: any) {
    const resp = await fetch(`/api/data/${collectionName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(`API Error: ${resp.status} - ${body.details || body.error || 'Unknown error'}`);
    }
    return resp.json();
  }

  async updateDocument(collectionName: string, docId: string, data: any) {
    const resp = await fetch(`/api/data/${collectionName}/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(`API Error: ${resp.status} - ${body.details || body.error || 'Unknown error'}`);
    }
    return resp.json();
  }

  async deleteDocument(collectionName: string, docId: string) {
    const resp = await fetch(`/api/data/${collectionName}/${docId}`, {
      method: 'DELETE'
    });
    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      throw new Error(`API Error: ${resp.status} - ${body.details || body.error || 'Unknown error'}`);
    }
    return resp.json();
  }

  // Helper for mode sync
  async syncModeFromServer() {
    try {
      const resp = await fetch('/api/settings/backend');
      if (resp.ok) {
        const { activeBackend } = await resp.json();
        this.activeBackend = activeBackend;
        return activeBackend;
      }
    } catch (err) {
      console.error('Failed to sync mode from server:', err);
    }
    return 'firebase'; 
  }
}

export const apiService = new ApiService();
