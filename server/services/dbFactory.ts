
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.resolve(process.cwd(), 'local_storage.db');
const sqlDb = new Database(dbPath);

// Initialize tables if they don't exist
const initializeSqlTables = () => {
  const tables = [
    'users', 'companies', 'factories', 'warehouses', 'products', 
    'inventory', 'salesOrders', 'productionRuns', 'procurementPlans'
  ];
  
  tables.forEach(table => {
    sqlDb.prepare(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id TEXT PRIMARY KEY,
        companyId TEXT,
        data TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  });
};

initializeSqlTables();

export interface IStorage {
  find(collection: string, query: any): Promise<any[]>;
  create(collection: string, data: any): Promise<any>;
  update(collection: string, id: string, data: any): Promise<any>;
}

class SQLStorage implements IStorage {
  async find(collection: string, queryOpts: any) {
    const { companyId } = queryOpts;
    const rows = sqlDb.prepare(`SELECT * FROM ${collection} WHERE companyId = ?`).all(companyId);
    return rows.map((row: any) => ({
      id: row.id,
      ...JSON.parse(row.data)
    }));
  }

  async create(collection: string, data: any) {
    const id = data.id || Math.random().toString(36).substr(2, 9);
    const companyId = data.companyId || '';
    const cleanData = { ...data };
    delete cleanData.id;
    
    sqlDb.prepare(`INSERT OR REPLACE INTO ${collection} (id, companyId, data) VALUES (?, ?, ?)`)
      .run(id, companyId, JSON.stringify(cleanData));
      
    return { id, ...cleanData };
  }

  async update(collection: string, id: string, data: any) {
    const existing = sqlDb.prepare(`SELECT data FROM ${collection} WHERE id = ?`).get(id) as any;
    const currentData = existing ? JSON.parse(existing.data) : {};
    const newData = { ...currentData, ...data };
    const companyId = newData.companyId || '';
    
    sqlDb.prepare(`UPDATE ${collection} SET data = ?, companyId = ? WHERE id = ?`)
      .run(JSON.stringify(newData), companyId, id);
      
    return { id, ...newData };
  }
}

class FirebaseStorage implements IStorage {
  async find(collection: string, query: any) {
    // This would use firebase-admin. Since we want to keep the frontend SDK logic 
    // for standard Firebase mode, this backend adapter is mostly used as a fallback
    // or if we decide to move all logic to the backend.
    console.log(`[Firebase] Fetching ${collection} for company ${query.companyId}`);
    return []; 
  }
  async create(collection: string, data: any) {
     return { id: 'firebase_id', ...data };
  }
  async update(collection: string, id: string, data: any) {
     return { id, ...data };
  }
}

export const getStorage = () => {
    try {
        const configPath = path.resolve(process.cwd(), 'app-config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.activeBackend === 'sql') {
            return new SQLStorage();
        }
    } catch (e) {
        console.error("Config read error, defaulting to firebase", e);
    }
    return new FirebaseStorage();
}
