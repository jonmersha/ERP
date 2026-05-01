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
    const { 
      id, 
      customerId, customer_id, 
      outletId, outlet_id, 
      status, 
      totalAmount, total_amount, 
      companyId, company_id 
    } = req.body;

    const finalCompanyId = companyId || company_id;
    if (!finalCompanyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const orderId = id || crypto.randomUUID();
    const finalCustomerId = customerId || customer_id;
    const finalOutletId = outletId || outlet_id;
    const finalTotalAmount = totalAmount || total_amount;

    await pool.query(
      'INSERT INTO sales_orders (id, customer_id, outlet_id, status, total_amount, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, finalCustomerId, finalOutletId, status || 'draft', finalTotalAmount || 0, finalCompanyId]
    );
    res.status(201).json({ id: orderId });
  } catch (error) {
    console.error('Error creating sales order:', error);
    res.status(500).json({ error: 'Failed to create sales order', details: error.message });
  }
};

export const updateSalesOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      customerId, customer_id, 
      outletId, outlet_id, 
      status, 
      totalAmount, total_amount 
    } = req.body;

    const finalCustomerId = customerId || customer_id;
    const finalOutletId = outletId || outlet_id;
    const finalTotalAmount = totalAmount || total_amount;

    await pool.query(
      'UPDATE sales_orders SET customer_id = ?, outlet_id = ?, status = ?, total_amount = ? WHERE id = ?',
      [finalCustomerId, finalOutletId, status, finalTotalAmount, id]
    );
    res.json({ message: 'Sales order updated' });
  } catch (error) {
    console.error('Error updating sales order:', error);
    res.status(500).json({ error: 'Failed to update sales order', details: error.message });
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
