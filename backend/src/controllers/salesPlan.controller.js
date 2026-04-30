import pool from '../db.js';
import crypto from 'node:crypto';

export const getAllSalesPlans = async (req, res) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM sales_plans';
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
      quarterlyPlans: row.quarterly_plans,
      createdAt: row.created_at
    }));

    mappedRows.forEach(row => {
      if (typeof row.quarterlyPlans === 'string') {
        try { row.quarterlyPlans = JSON.parse(row.quarterlyPlans); } catch (e) {}
      }
    });

    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales plans' });
  }
};

export const createSalesPlan = async (req, res) => {
  try {
    const { factoryId, productId, year, totalQuantity, status, companyId, quarterlyPlans } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO sales_plans (id, factory_id, product_id, year, total_quantity, status, company_id, quarterly_plans) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, factoryId, productId, year, totalQuantity, status || 'draft', companyId, JSON.stringify(quarterlyPlans || [])]
    );
    res.status(201).json({ id });
  } catch (error) {
    console.error('Create sales plan error:', error);
    res.status(500).json({ error: 'Failed to create sales plan' });
  }
};

export const updateSalesPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { factoryId, productId, year, totalQuantity, status, quarterlyPlans } = req.body;
    await pool.query(
      'UPDATE sales_plans SET factory_id = ?, product_id = ?, year = ?, total_quantity = ?, status = ?, quarterly_plans = ? WHERE id = ?',
      [factoryId, productId, year, totalQuantity, status, JSON.stringify(quarterlyPlans || []), id]
    );
    res.json({ message: 'Sales plan updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sales plan' });
  }
};

export const deleteSalesPlan = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sales_plans WHERE id = ?', [id]);
    res.json({ message: 'Sales plan deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sales plan' });
  }
};
