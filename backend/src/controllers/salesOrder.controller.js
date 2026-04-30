import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/sales:
 *   get:
 *     summary: Retrieve sales plans
 *     responses:
 *       200:
 *         description: Sales plans list
 *   post:
 *     summary: Create a new sale plan
 *     responses:
 *       201:
 *         description: Sale plan created
 * /api/sales/{id}:
 *   put:
 *     summary: Update a sale plan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale plan updated
 *   delete:
 *     summary: Delete a sale plan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sale plan deleted
 */
export const getAllSalesOrders = async (req, res) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM sales_orders';
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
      customerId: row.customer_id,
      outletId: row.outlet_id,
      totalAmount: row.total_amount,
      createdAt: row.created_at
    }));
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales orders' });
  }
};

export const createSalesOrder = async (req, res) => {
  try {
    const { id, customer_id, outlet_id, status, total_amount, company_id } = req.body;
    const orderId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO sales_orders (id, customer_id, outlet_id, status, total_amount, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, customer_id, outlet_id, status, total_amount, company_id]
    );
    res.status(201).json({ id: orderId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sales order' });
  }
};

export const updateSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, outlet_id, status, total_amount } = req.body;
    await pool.query(
      'UPDATE sales_orders SET customer_id = ?, outlet_id = ?, status = ?, total_amount = ? WHERE id = ?',
      [customer_id, outlet_id, status, total_amount, id]
    );
    res.json({ message: 'Sales order updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sales order' });
  }
};

export const deleteSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sales_orders WHERE id = ?', [id]);
    res.json({ message: 'Sales order deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sales order' });
  }
};
