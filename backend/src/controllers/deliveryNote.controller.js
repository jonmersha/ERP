import pool from '../db.js';
import crypto from 'node:crypto';

export const getAllDeliveryNotes = async (req, res) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM delivery_notes';
    let params = [];
    if (companyId) {
      query += ' WHERE company_id = ?';
      params.push(companyId);
    }
    const [rows] = await pool.query(query, params);
    
    // map snake_case to camelCase
    const mappedRows = rows.map(row => ({
      ...row,
      salesOrderId: row.sales_order_id,
      outletId: row.outlet_id,
      dispatchDate: row.dispatch_date,
      companyId: row.company_id,
      createdAt: row.created_at
    }));
    
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Delivery Notes' });
  }
};

export const createDeliveryNote = async (req, res) => {
  try {
    const { salesOrderId, outletId, dispatchDate, status, companyId } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO delivery_notes (id, sales_order_id, outlet_id, dispatch_date, status, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, salesOrderId, outletId, dispatchDate || new Date(), status || 'dispatched', companyId]
    );
    res.status(201).json({ id });
  } catch (error) {
    console.error('Create Delivery Note error:', error);
    res.status(500).json({ error: 'Failed to create Delivery Note' });
  }
};
