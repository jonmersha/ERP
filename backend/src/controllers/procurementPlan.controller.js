import pool from '../db.js';
import crypto from 'node:crypto';

export const getAllProcurementPlans = async (req, res) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM procurement_plans';
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
      warehouseId: row.warehouse_id,
      materialId: row.material_id,
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
    res.status(500).json({ error: 'Failed to fetch procurement plans' });
  }
};

export const createProcurementPlan = async (req, res) => {
  try {
    const { warehouseId, materialId, year, totalQuantity, status, companyId, quarterlyPlans } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO procurement_plans (id, warehouse_id, material_id, year, total_quantity, status, company_id, quarterly_plans) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, warehouseId, materialId, year, totalQuantity, status || 'planned', companyId, JSON.stringify(quarterlyPlans || [])]
    );
    res.status(201).json({ id });
  } catch (error) {
    console.error('Create procurement plan error:', error);
    res.status(500).json({ error: 'Failed to create procurement plan' });
  }
};

export const updateProcurementPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { warehouseId, materialId, year, totalQuantity, status, quarterlyPlans } = req.body;
    await pool.query(
      'UPDATE procurement_plans SET warehouse_id = ?, material_id = ?, year = ?, total_quantity = ?, status = ?, quarterly_plans = ? WHERE id = ?',
      [warehouseId, materialId, year, totalQuantity, status, JSON.stringify(quarterlyPlans || []), id]
    );
    res.json({ message: 'Procurement plan updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update procurement plan' });
  }
};

export const deleteProcurementPlan = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM procurement_plans WHERE id = ?', [id]);
    res.json({ message: 'Procurement plan deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete procurement plan' });
  }
};
