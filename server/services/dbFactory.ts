
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

const getPool = () => {
  if (!pool) {
    // Cleanup env vars that might have "base"
    const dbEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_DATABASE', 'MYSQL_PASSWORD', 'MYSQL_PORT', 'DATABASE_URL', 'PGHOST', 'PGUSER', 'PGDATABASE', 'PGPASSWORD', 'PGPORT'];
    dbEnvVars.forEach(v => {
      const val = process.env[v];
      if (val && (val.toLowerCase() === 'base' || val.includes('base'))) {
        delete process.env[v];
      }
    });

    const options: mysql.PoolOptions = {
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };

    // Manual parsing of DATABASE_URL if present to avoid TypeError: Invalid URL in some environments
    let currentConnectionString = process.env.DATABASE_URL;
    if (currentConnectionString === 'undefined' || currentConnectionString === 'null' || (currentConnectionString && currentConnectionString.length < 10)) {
       currentConnectionString = undefined;
    }
    
    console.log('DB Connection Debug:', {
      hasConnectionString: !!currentConnectionString,
      MYSQL_HOST: process.env.MYSQL_HOST,
      MYSQL_PORT: process.env.MYSQL_PORT,
      PGHOST: process.env.PGHOST,
      PGPORT: process.env.PGPORT,
      DATABASE_URL_START: currentConnectionString ? currentConnectionString.substring(0, 15) + '...' : 'none'
    });

    if (currentConnectionString && currentConnectionString.toLowerCase().startsWith('mysql://')) {
      try {
        console.log('Parsing DATABASE_URL manually...');
        const urlMatch = currentConnectionString.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (urlMatch) {
          options.user = urlMatch[1];
          options.password = urlMatch[2];
          options.host = urlMatch[3];
          options.port = parseInt(urlMatch[4]);
          options.database = urlMatch[5];
        } else {
          // Fallback to simple URL parser but catch error
          const parsed = new URL(currentConnectionString);
          options.user = decodeURIComponent(parsed.username);
          options.password = decodeURIComponent(parsed.password);
          options.host = parsed.hostname;
          options.port = parseInt(parsed.port) || 3306;
          options.database = parsed.pathname.startsWith('/') ? parsed.pathname.slice(1) : parsed.pathname;
        }
      } catch (e) {
        console.warn('Failed to parse DATABASE_URL, falling back to individual env vars:', e);
      }
    }

    const isMySQL = currentConnectionString?.toLowerCase().startsWith('mysql://') || process.env.MYSQL_HOST;
    
    if (!options.host) options.host = process.env.MYSQL_HOST || (isMySQL ? undefined : process.env.PGHOST) || 'localhost';
    if (!options.user) options.user = process.env.MYSQL_USER || (isMySQL ? undefined : process.env.PGUSER) || 'erpuser';
    if (!options.password) options.password = process.env.MYSQL_PASSWORD || (isMySQL ? undefined : process.env.PGPASSWORD) || 'xyz';
    if (!options.database) options.database = process.env.MYSQL_DATABASE || (isMySQL ? undefined : process.env.PGDATABASE) || 'erpsystem';
    if (!options.port) {
      const envPort = isMySQL ? process.env.MYSQL_PORT : (process.env.MYSQL_PORT || process.env.PGPORT);
      options.port = parseInt(envPort || '3306');
      // Intelligent Correction: if it's 3600 and failing, maybe it's 3306?
      // But we better just trust 3306 by default if 3600 is likely a typo.
      if (options.port === 3600 && options.host === 'localhost') {
         console.warn('Port 3600 detected on localhost. This is unusual for MySQL. Defaulting to 3306 unless explicitly required.');
         options.port = 3306;
      }
    }

    console.log('Final Database Configuration:', {
      host: options.host,
      user: options.user,
      database: options.database,
      port: options.port,
      adapter: 'mysql'
    });

    try {
      pool = mysql.createPool(options);
    } catch (createError) {
      console.error('CRITICAL: Failed to create MySQL pool:', createError);
      throw createError;
    }
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
          'inventory', 'salesOrders', 'productionRuns', 'procurementPlans', 
          'productionPlans', 'outlets', 'suppliers', 'rawMaterials', 
          'categories', 'employees', 'purchaseOrders', 'salesPlans'
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
  getOne(collection: string, id: string): Promise<any | null>;
  create(collection: string, data: any): Promise<any>;
  update(collection: string, id: string, data: any): Promise<any>;
  delete(collection: string, id: string): Promise<void>;
}

class SQLStorage implements IStorage {
  async find(collection: string, queryOpts: any) {
    const { companyId, limitCount, orderByField, orderDir } = queryOpts;
    await ensureTable(collection);
    
    const activePool = getPool();
    let sql = `SELECT * FROM \`${collection}\` WHERE companyId = ?`;
    const params: any[] = [companyId];

    if (orderByField) {
      const direction = orderDir?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
      // Basic sanitization for column/field name
      if (/^[a-zA-Z0-9_]+$/.test(orderByField)) {
        // Since custom fields are inside data JSON, we might need to handle them differently
        // or just rely on 'createdAt' which is a real column.
        if (orderByField === 'createdAt' || orderByField === 'id') {
          sql += ` ORDER BY ${orderByField} ${direction}`;
        } else {
          sql += ` ORDER BY data->>'$.${orderByField}' ${direction}`;
        }
      }
    }

    if (limitCount && !isNaN(parseInt(limitCount))) {
      sql += ` LIMIT ${parseInt(limitCount)}`;
    }

    const [rows]: [any[], any] = await activePool.query(sql, params);
    return rows.map((row: any) => ({
      id: row.id,
      ...row.data
    }));
  }

  async getOne(collection: string, id: string) {
    await ensureTable(collection);
    const activePool = getPool();
    const [rows]: [any[], any] = await activePool.query(`SELECT * FROM \`${collection}\` WHERE id = ?`, [id]);
    if (rows.length === 0) return null;
    return { id: rows[0].id, ...rows[0].data };
  }

  async create(collection: string, data: any) {
    await ensureTable(collection);
    const id = data.id || Math.random().toString(36).substr(2, 9);
    const companyId = data.companyId || '';
    const cleanData = { ...data };
    delete cleanData.id;
    
    const activePool = getPool();
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
    const [rows]: [any[], any] = await activePool.query(`SELECT data, companyId FROM \`${collection}\` WHERE id = ?`, [id]);
    const currentData = rows[0] ? rows[0].data : {};
    const newData = { ...currentData, ...data };
    const companyId = newData.companyId || rows[0]?.companyId || '';
    
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
  async find(collection: string, queryOpts: any) {
    const { companyId, limitCount, orderByField, orderDir } = queryOpts;
    const { db } = await import('../firebase.js');
    let q = db.collection(collection).where("companyId", "==", companyId);
    
    if (orderByField) {
      q = q.orderBy(orderByField, orderDir || 'desc');
    }
    
    if (limitCount) {
      q = q.limit(parseInt(limitCount));
    }
    
    const snap = await q.get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getOne(collection: string, id: string) {
    const { db } = await import('../firebase.js');
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async create(collection: string, data: any) {
    const { db } = await import('../firebase.js');
    const cleanData = { ...data };
    if (!cleanData.createdAt) cleanData.createdAt = new Date().toISOString();
    
    if (data.id) {
        const id = data.id;
        delete cleanData.id;
        await db.collection(collection).doc(id).set(cleanData);
        return { id, ...cleanData };
    } else {
        const docRef = await db.collection(collection).add(cleanData);
        return { id: docRef.id, ...cleanData };
    }
  }

  async update(collection: string, id: string, data: any) {
    const { db } = await import('../firebase.js');
    const cleanData = { ...data };
    delete cleanData.id;
    await db.collection(collection).doc(id).update({
        ...cleanData,
        updatedAt: new Date().toISOString()
    });
    return { id, ...cleanData };
  }

  async delete(collection: string, id: string) {
    const { db } = await import('../firebase.js');
    await db.collection(collection).doc(id).delete();
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
