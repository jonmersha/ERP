
import "dotenv/config";
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

const getPool = () => {
  if (!pool) {
    // Check for .env file existence
    const dotEnvPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(dotEnvPath)) {
      console.warn('WARNING: .env file not found in root directory. Database credentials might be missing.');
    }

    const options: mysql.PoolOptions = {
      waitForConnections: true,
      connectionLimit: 20,
      queueLimit: 0,
      idleTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    };

    let currentConnectionString = process.env.DATABASE_URL;
    if (currentConnectionString === 'undefined' || currentConnectionString === 'null' || (currentConnectionString && currentConnectionString.length < 10)) {
       currentConnectionString = undefined;
    }
    
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

    if (!options.host) options.host = process.env.MYSQL_HOST;
    if (!options.user) options.user = process.env.MYSQL_USER;
    if (!options.password) options.password = process.env.MYSQL_PASSWORD;
    if (!options.database) options.database = process.env.MYSQL_DATABASE;
    if (!options.port) {
      const p = process.env.MYSQL_PORT;
      options.port = parseInt(p || '3306');
    }

    if (options.port === 3600 && options.host === 'localhost') {
        console.warn('HINT: Port 3600 on localhost is very unusual for MySQL. Standard is 3306. If connection fails, check your environment variables.');
    }

    // Validation: Check env vars but don't throw yet, handle gracefully in getPool
    const isConfigMissing = !options.host || !options.user || !options.database;
    
    if (isConfigMissing) {
      const missing = [];
      if (!options.host) missing.push('MYSQL_HOST');
      if (!options.user) missing.push('MYSQL_USER');
      if (!options.database) missing.push('MYSQL_DATABASE');
      
      console.warn('Database configuration is incomplete. Some features may be disabled.');
      console.log('Missing variables:', missing.join(', '));
      
      // If we are in SQL mode but missing vars, we will eventually fail when a query is made.
      // We don't throw here to allow the server to start (e.g. for health checks or non-db routes).
    }

    console.log('Database Configuration Attempt:', {
      host: options.host || 'MISSING',
      user: options.user || 'MISSING',
      database: options.database || 'MISSING',
      port: options.port,
      hasPassword: !!options.password
    });

    if (options.port === 3600 && (options.host === 'localhost' || options.host === '127.0.0.1')) {
       console.warn('Detected port 3600 on localhost. This is unusual for MySQL (standard is 3306).');
       console.warn('If you see ECONNREFUSED 127.0.0.1:3600, please update your MYSQL_PORT to 3306 in .env');
    }

    try {
      if (isConfigMissing) {
         console.error('Cannot create MySQL pool: Missing required credentials.');
      } else {
         pool = mysql.createPool(options);
      }
    } catch (createError) {
      console.error('CRITICAL: Failed to create MySQL pool:', createError);
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
        console.log('SQL Mode detected, checking database connectivity...');
        
        // Test connection first
        const p = getPool();
        if (!p) {
          console.error('SQL Mode active but Database Pool could not be initialized. Skipping table creation.');
          return;
        }

        const tables = [
          'users', 'companies', 'factories', 'warehouses', 'products', 
          'inventory', 'salesOrders', 'productionRuns', 'procurementPlans', 
          'productionPlans', 'outlets', 'suppliers', 'rawMaterials', 
          'categories', 'employees', 'purchaseOrders', 'salesPlans', 'recipes',
          'grns', 'deliveryNotes'
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
    if (!activePool) {
      throw new Error(`Database connection pool not initialized. Cannot ensure table ${table}. Please check your environment variables (MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE).`);
    }
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
      let extraHint = '';
      if (err.message.includes('3600')) {
        extraHint = ' (Note: Port 3600 is being used. Did you mean 3306 in your .env?)';
      }
      throw new Error(`MySQL Connection Failed. Please ensure your database is running and credentials in .env are correct.${extraHint} Original error: ${err.message}`);
    }
    throw err; 
  }
};

// Start initialization if SQL mode
initializeSqlTables().catch(err => console.error('SQL Initialization failed:', err));

export interface IStorage {
  find(collection: string, query: any): Promise<any[]>;
  findOne(collection: string, id: string): Promise<any | null>;
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

  async findOne(collection: string, id: string) {
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
    
    // Dynamically identify columns in the table and match them with data fields
    // This allows promoting some JSON fields to actual columns for indexing/FKs
    const [columns]: [any[], any] = await activePool.query(`SHOW COLUMNS FROM \`${collection}\``);
    const colNames = columns.map(c => c.Field);
    
    const fields = ['id', 'companyId', 'data'];
    const values = [id, companyId, JSON.stringify(cleanData)];
    
    // Add extra columns if they exist in the incoming data
    colNames.forEach(col => {
        if (!fields.includes(col) && data[col] !== undefined && col !== 'createdAt') {
            fields.push(col);
            values.push(data[col]);
        }
    });

    const placeholders = fields.map(() => '?').join(', ');
    const updateClause = fields.filter(f => f !== 'id').map(f => `\`${f}\` = VALUES(\`${f}\`)`).join(', ');
    
    await activePool.query(
      `INSERT INTO \`${collection}\` (${fields.map(f => `\`${f}\``).join(', ')}) 
       VALUES (${placeholders}) 
       ON DUPLICATE KEY UPDATE ${updateClause}`,
      [...values]
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
    
    // Dynamically identify columns to update
    const [columns]: [any[], any] = await activePool.query(`SHOW COLUMNS FROM \`${collection}\``);
    const colNames = columns.map(c => c.Field);
    
    const fields = ['data', 'companyId'];
    const values = [JSON.stringify(newData), companyId];
    
    colNames.forEach(col => {
        if (!['id', 'companyId', 'data', 'createdAt'].includes(col) && newData[col] !== undefined) {
            fields.push(col);
            values.push(newData[col]);
        }
    });

    const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');
    
    await activePool.query(
      `UPDATE \`${collection}\` SET ${setClause} WHERE id = ?`,
      [...values, id]
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
    const { getDb } = await import('../firebase.js');
    const db = getDb();
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

  async findOne(collection: string, id: string) {
    const { getDb } = await import('../firebase.js');
    const db = getDb();
    const doc = await db.collection(collection).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async create(collection: string, data: any) {
    const { getDb } = await import('../firebase.js');
    const db = getDb();
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
    const { getDb } = await import('../firebase.js');
    const db = getDb();
    const cleanData = { ...data };
    delete cleanData.id;
    await db.collection(collection).doc(id).update({
        ...cleanData,
        updatedAt: new Date().toISOString()
    });
    return { id, ...cleanData };
  }

  async delete(collection: string, id: string) {
    const { getDb } = await import('../firebase.js');
    const db = getDb();
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
