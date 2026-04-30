import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/warehouses:
 *   get:
 *     summary: Retrieve list of warehouses
 *     responses:
 *       200:
 *         description: A list of warehouses
 *   post:
 *     summary: Create a new warehouse
 *     responses:
 *       201:
 *         description: Warehouse created
 * /api/warehouses/{id}:
 *   put:
 *     summary: Update a warehouse
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse updated
 *   delete:
 *     summary: Delete a warehouse
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Warehouse deleted
 */
export const getAllWarehouses = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM warehouses');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const { id, name, location, factory_id, company_id } = req.body;
    const warehouseId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO warehouses (id, name, location, factory_id, company_id) VALUES (?, ?, ?, ?, ?)',
      [warehouseId, name, location, factory_id, company_id]
    );
    res.status(201).json({ id: warehouseId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, factory_id } = req.body;
    await pool.query(
      'UPDATE warehouses SET name = ?, location = ?, factory_id = ? WHERE id = ?',
      [name, location, factory_id, id]
    );
    res.json({ message: 'Warehouse updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM warehouses WHERE id = ?', [id]);
    res.json({ message: 'Warehouse deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete warehouse' });
  }
};
