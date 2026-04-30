import pool from '../db.js';
import crypto from 'node:crypto';

export const getAllGRNs = async (req, res) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM grns';
    let params = [];
    if (companyId) {
      query += ' WHERE company_id = ?';
      params.push(companyId);
    }
    const [rows] = await pool.query(query, params);
    
    // map snake_case to camelCase
    const mappedRows = rows.map(row => ({
      ...row,
      purchaseOrderId: row.purchase_order_id,
      warehouseId: row.warehouse_id,
      receiptDate: row.receipt_date,
      companyId: row.company_id,
      createdAt: row.created_at
    }));
    
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch GRNs' });
  }
};

export const createGRN = async (req, res) => {
  try {
    const { purchaseOrderId, warehouseId, receiptDate, status, companyId } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO grns (id, purchase_order_id, warehouse_id, receipt_date, status, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, purchaseOrderId, warehouseId, receiptDate || new Date(), status || 'received', companyId]
    );
    res.status(201).json({ id });
  } catch (error) {
    console.error('Create GRN error:', error);
    res.status(500).json({ error: 'Failed to create GRN' });
  }
};
