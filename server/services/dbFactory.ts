
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

const getPool = () => {
  if (!pool) {
    const rawHost = process.env.PGHOST;
    const rawConnectionString = process.env.DATABASE_URL;

    // Cleanup all PG env vars that might have "base"
    const pgEnvVars = ['PGHOST', 'PGUSER', 'PGDATABASE', 'PGPASSWORD', 'PGPORT', 'DATABASE_URL'];
    pgEnvVars.forEach(v => {
      const val = process.env[v];
      if (val && (val.toLowerCase() === 'base' || val.includes('base'))) {
        delete process.env[v];
      }
    });

    // Use FRESH values after cleanup
    const currentConnectionString = process.env.DATABASE_URL;
    const currentHost = process.env.PGHOST;

    let finalConnectionString: string | undefined = undefined;
    if (currentConnectionString && !currentConnectionString.includes('base')) {
      finalConnectionString = currentConnectionString;
    }

    let finalHost = currentHost;
    if (!finalHost || finalHost.trim().toLowerCase() === 'base') {
      finalHost = 'localhost';
    }

    const config: pg.PoolConfig = {
      connectionString: finalConnectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    if (!finalConnectionString) {
      config.host = finalHost;
      config.user = process.env.PGUSER || 'postgres';
      config.password = process.env.PGPASSWORD || 'postgres';
      config.database = process.env.PGDATABASE || 'erp_db';
      config.port = parseInt(process.env.PGPORT || '5432');
    }

    console.log('Final PostgreSQL Pool Config:', {
      hasConnectionString: !!config.connectionString,
      host: config.host,
      user: config.user,
      database: config.database,
      port: config.port
    });

    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('Unexpected error on idle postgres client', err);
    });
  }
  return pool;
};

// Initialize tables if they don't exist
const initializeSqlTables = async () => {
  try {
    let configPath = path.resolve(process.cwd(), 'app-config.json');
    if (!fs.existsSync(configPath)) {
      configPath = path.resolve(process.cwd(), '..', 'app-config.json');
    }
    
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.activeBackend === 'sql') {
        console.log('SQL Mode detected, ensuring tables...');
        const tables = [
          'users', 'companies', 'factories', 'warehouses', 'products', 
          'inventory', 'salesOrders', 'productionRuns', 'procurementPlans', 'productionPlans'
        ];
        
        for (const table of tables) {
          await ensureTable(table);
        }
      }
    }
  } catch (err) {
    console.error('Failed to initialize SQL mode:', err);
  }
};

const ensureTable = async (table: string) => {
  try {
    const activePool = getPool();
    // Basic table structure for the JSON-based storage pattern
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS "${table}" (
        id TEXT PRIMARY KEY,
        "companyId" TEXT,
        data JSONB,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err: any) {
    console.error(`Error ensuring table ${table}:`, err);
    if (err.message.includes('getaddrinfo') || err.message.includes('ECONNREFUSED')) {
      throw new Error(`PostgreSQL Connection Failed. Please ensure your database is running and credentials in .env are correct. Original error: ${err.message}`);
    }
    throw err; 
  }
};

// Start initialization if SQL mode
initializeSqlTables().catch(err => console.error('SQL Initialization failed:', err));

export interface IStorage {
  find(collection: string, query: any): Promise<any[]>;
  create(collection: string, data: any): Promise<any>;
  update(collection: string, id: string, data: any): Promise<any>;
  delete(collection: string, id: string): Promise<void>;
}

class SQLStorage implements IStorage {
  async find(collection: string, queryOpts: any) {
    const { companyId } = queryOpts;
    await ensureTable(collection);
    
    const activePool = getPool();
    const res = await activePool.query(`SELECT * FROM "${collection}" WHERE "companyId" = $1`, [companyId]);
    return res.rows.map((row: any) => ({
      id: row.id,
      ...row.data
    }));
  }

  async create(collection: string, data: any) {
    await ensureTable(collection);
    const id = data.id || Math.random().toString(36).substr(2, 9);
    const companyId = data.companyId || '';
    const cleanData = { ...data };
    delete cleanData.id;
    
    const activePool = getPool();
    await activePool.query(
      `INSERT INTO "${collection}" (id, "companyId", data) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (id) DO UPDATE SET data = $3, "companyId" = $2`,
      [id, companyId, cleanData]
    );
      
    return { id, ...cleanData };
  }

  async update(collection: string, id: string, data: any) {
    await ensureTable(collection);
    const activePool = getPool();
    const existingRes = await activePool.query(`SELECT data FROM "${collection}" WHERE id = $1`, [id]);
    const currentData = existingRes.rows[0] ? existingRes.rows[0].data : {};
    const newData = { ...currentData, ...data };
    const companyId = newData.companyId || '';
    
    await activePool.query(
      `UPDATE "${collection}" SET data = $1, "companyId" = $2 WHERE id = $3`,
      [newData, companyId, id]
    );
      
    return { id, ...newData };
  }

  async delete(collection: string, id: string) {
    const activePool = getPool();
    await activePool.query(`DELETE FROM "${collection}" WHERE id = $1`, [id]);
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
  async delete(collection: string, id: string) {
     console.log(`[Firebase] Deleting ${id} from ${collection}`);
  }
}

export const getStorage = () => {
    try {
        // Look for config in parent directory (root) if running from /server/services
        // or current directory if running from root.
        let configPath = path.resolve(process.cwd(), 'app-config.json');
        if (!fs.existsSync(configPath)) {
            configPath = path.resolve(process.cwd(), '..', 'app-config.json');
        }
        
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.activeBackend === 'sql') {
            return new SQLStorage();
        }
    } catch (e) {
        console.error("Config read error, defaulting to firebase", e);
    }
    return new FirebaseStorage();
}
