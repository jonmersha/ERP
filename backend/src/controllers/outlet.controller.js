import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/outlets:
 *   get:
 *     summary: Retrieve list of outlets
 *     responses:
 *       200:
 *         description: A list of outlets
 *   post:
 *     summary: Create a new outlet
 *     responses:
 *       201:
 *         description: Outlet created
 * /api/outlets/{id}:
 *   put:
 *     summary: Update an outlet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Outlet updated
 *   delete:
 *     summary: Delete an outlet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Outlet deleted
 */
export const getAllOutlets = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sales_outlets');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch outlets' });
  }
};

export const createOutlet = async (req, res) => {
  try {
    const { id, name, location, company_id } = req.body;
    const outletId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO sales_outlets (id, name, location, company_id) VALUES (?, ?, ?, ?)',
      [outletId, name, location, company_id]
    );
    res.status(201).json({ id: outletId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create outlet' });
  }
};

export const updateOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    await pool.query(
      'UPDATE sales_outlets SET name = ?, location = ? WHERE id = ?',
      [name, location, id]
    );
    res.json({ message: 'Outlet updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update outlet' });
  }
};

export const deleteOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sales_outlets WHERE id = ?', [id]);
    res.json({ message: 'Outlet deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete outlet' });
  }
};
