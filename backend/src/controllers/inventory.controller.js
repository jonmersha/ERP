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
    const { companyId } = req.query;
    let query = 'SELECT * FROM inventory';
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
      unitId: row.unit_id,
      itemId: row.item_id,
      itemType: row.item_type,
      batchNumber: row.batch_number,
      expiryDate: row.expiry_date
    }));
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

export const createInventory = async (req, res) => {
  try {
    const { id, unit_id, item_id, item_type, quantity, batch_number, expiry_date, company_id } = req.body;
    const inventoryId = id || crypto.randomUUID();
    const formattedExpiryDate = expiry_date ? new Date(expiry_date).toISOString().split('T')[0] : null;

    await pool.query(
      'INSERT INTO inventory (id, unit_id, item_id, item_type, quantity, batch_number, expiry_date, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [inventoryId, unit_id, item_id, item_type, quantity, batch_number, formattedExpiryDate, company_id]
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
    const formattedExpiryDate = expiry_date ? new Date(expiry_date).toISOString().split('T')[0] : null;

    await pool.query(
      'UPDATE inventory SET unit_id = ?, item_id = ?, item_type = ?, quantity = ?, batch_number = ?, expiry_date = ? WHERE id = ?',
      [unit_id, item_id, item_type, quantity, batch_number, formattedExpiryDate, id]
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
