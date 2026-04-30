import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Promisify for async/await
const pool = {
  query: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      // Use run for non-SELECT, all for SELECT
      const trimmedSql = sql.trim().toUpperCase();
      if (trimmedSql.startsWith('SELECT') || trimmedSql.startsWith('SHOW') || trimmedSql.startsWith('PRAGMA')) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve([rows]);
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve([{ affectedRows: this.changes, insertId: this.lastID }]);
        });
      }
    });
  }
};

export default pool;
