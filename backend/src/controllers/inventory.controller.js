import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/inventory:
 *   get:
 *     summary: Retrieve inventory
 *     responses:
 *       200:
 *         description: Inventory list
 *   post:
 *     summary: Add item to inventory
 *     responses:
 *       201:
 *         description: Inventory item added
 * /api/inventory/{id}:
 *   put:
 *     summary: Update inventory item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item updated
 *   delete:
 *     summary: Delete inventory item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item deleted
 */
export const getInventory = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inventory');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const createInventory = async (req, res) => {
  try {
    const { id, unit_id, item_id, item_type, quantity, batch_number, expiry_date, company_id } = req.body;
    const inventoryId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO inventory (id, unit_id, item_id, item_type, quantity, batch_number, expiry_date, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [inventoryId, unit_id, item_id, item_type, quantity, batch_number, expiry_date, company_id]
    );
    res.status(201).json({ id: inventoryId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { unit_id, item_id, item_type, quantity, batch_number, expiry_date } = req.body;
    await pool.query(
      'UPDATE inventory SET unit_id = ?, item_id = ?, item_type = ?, quantity = ?, batch_number = ?, expiry_date = ? WHERE id = ?',
      [unit_id, item_id, item_type, quantity, batch_number, expiry_date, id]
    );
    res.json({ message: 'Inventory item updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM inventory WHERE id = ?', [id]);
    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};
