import pool from '../db.js';
import crypto from 'node:crypto';

export const getAllProductionPlans = async (req, res) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM production_plans';
    let params = [];
    if (companyId) {
      query += ' WHERE company_id = ?';
      params.push(companyId);
    }
    const [rows] = await pool.query(query, params);
    
    // map snake_case to camelCase
    const mappedRows = rows.map(row => ({
      ...row,
      companyId: row.company_id,
      factoryId: row.factory_id,
      productId: row.product_id,
      totalQuantity: row.total_quantity,
      createdAt: new Date().toISOString() // Fallback since it's not in DB schema
    }));
    
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch production plans' });
  }
};
