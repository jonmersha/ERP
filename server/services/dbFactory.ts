
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

const getPool = () => {
  if (!pool) {
    const rawHost = process.env.MYSQL_HOST || process.env.PGHOST; // fallback for transition
    const rawConnectionString = process.env.DATABASE_URL;

    // Cleanup env vars that might have "base"
    const dbEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_DATABASE', 'MYSQL_PASSWORD', 'MYSQL_PORT', 'DATABASE_URL', 'PGHOST', 'PGUSER', 'PGDATABASE', 'PGPASSWORD', 'PGPORT'];
    dbEnvVars.forEach(v => {
      const val = process.env[v];
      if (val && (val.toLowerCase() === 'base' || val.includes('base'))) {
        delete process.env[v];
      }
    });

    // Use FRESH values after cleanup
    const currentConnectionString = process.env.DATABASE_URL;
    const currentHost = process.env.MYSQL_HOST || process.env.PGHOST;

    let finalConnectionString: string | undefined = undefined;
    if (currentConnectionString && !currentConnectionString.includes('base')) {
      finalConnectionString = currentConnectionString;
    }

    let finalHost = currentHost;
    if (!finalHost || finalHost.trim().toLowerCase() === 'base') {
      finalHost = 'localhost';
    }

    const config: mysql.PoolOptions = {
      uri: finalConnectionString,
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };

    if (!finalConnectionString) {
      config.host = finalHost;
      config.user = process.env.MYSQL_USER || process.env.PGUSER || 'erpuser';
      config.password = process.env.MYSQL_PASSWORD || process.env.PGPASSWORD || 'xyz';
      config.database = process.env.MYSQL_DATABASE || process.env.PGDATABASE || 'erpsystem';
      config.port = parseInt(process.env.MYSQL_PORT || process.env.PGPORT || '3306');
    }

    console.log('Final MySQL Pool Config:', {
      hasConnectionString: !!config.uri,
      host: config.host,
      user: config.user,
      database: config.database,
      port: config.port
    });

    pool = mysql.createPool(config);
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
    // MySQL table structure
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS \`${table}\` (
        id VARCHAR(255) PRIMARY KEY,
        companyId VARCHAR(255),
        data JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err: any) {
    console.error(`Error ensuring table ${table}:`, err);
    if (err.message.includes('getaddrinfo') || err.message.includes('ECONNREFUSED')) {
      throw new Error(`MySQL Connection Failed. Please ensure your database is running and credentials in .env are correct. Original error: ${err.message}`);
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
    const [rows]: [any[], any] = await activePool.query(`SELECT * FROM \`${collection}\` WHERE companyId = ?`, [companyId]);
    return rows.map((row: any) => ({
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
    // MySQL INSERT ... ON DUPLICATE KEY UPDATE
    await activePool.query(
      `INSERT INTO \`${collection}\` (id, companyId, data) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE data = ?, companyId = ?`,
      [id, companyId, JSON.stringify(cleanData), JSON.stringify(cleanData), companyId]
    );
      
    return { id, ...cleanData };
  }

  async update(collection: string, id: string, data: any) {
    await ensureTable(collection);
    const activePool = getPool();
    const [rows]: [any[], any] = await activePool.query(`SELECT data FROM \`${collection}\` WHERE id = ?`, [id]);
    const currentData = rows[0] ? rows[0].data : {};
    const newData = { ...currentData, ...data };
    const companyId = newData.companyId || '';
    
    await activePool.query(
      `UPDATE \`${collection}\` SET data = ?, companyId = ? WHERE id = ?`,
      [JSON.stringify(newData), companyId, id]
    );
      
    return { id, ...newData };
  }

  async delete(collection: string, id: string) {
    const activePool = getPool();
    await activePool.query(`DELETE FROM \`${collection}\` WHERE id = ?`, [id]);
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
