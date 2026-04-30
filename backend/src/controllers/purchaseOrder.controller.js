import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/procurement:
 *   get:
 *     summary: Retrieve procurement plans
 *     responses:
 *       200:
 *         description: Procurement plans list
 *   post:
 *     summary: Create a new procurement plan
 *     responses:
 *       201:
 *         description: Procurement plan created
 * /api/procurement/{id}:
 *   put:
 *     summary: Update a procurement plan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Procurement plan updated
 *   delete:
 *     summary: Delete a procurement plan
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Procurement plan deleted
 */
export const getAllPurchaseOrders = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM purchase_orders');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const { id, supplier_id, factory_id, status, total_amount, company_id } = req.body;
    const orderId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO purchase_orders (id, supplier_id, factory_id, status, total_amount, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, supplier_id, factory_id, status, total_amount, company_id]
    );
    res.status(201).json({ id: orderId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_id, factory_id, status, total_amount } = req.body;
    await pool.query(
      'UPDATE purchase_orders SET supplier_id = ?, factory_id = ?, status = ?, total_amount = ? WHERE id = ?',
      [supplier_id, factory_id, status, total_amount, id]
    );
    res.json({ message: 'Purchase order updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM purchase_orders WHERE id = ?', [id]);
    res.json({ message: 'Purchase order deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
};
