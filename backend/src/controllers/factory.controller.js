import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/factories:
 *   get:
 *     summary: Retrieve list of factories
 *     responses:
 *       200:
 *         description: A list of factories
 *   post:
 *     summary: Create a new factory
 *     responses:
 *       201:
 *         description: Factory created
 * /api/factories/{id}:
 *   put:
 *     summary: Update a factory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Factory updated
 *   delete:
 *     summary: Delete a factory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Factory deleted
 */
export const getAllFactories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM factories');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch factories' });
  }
};

export const createFactory = async (req, res) => {
  try {
    const { id, name, location, company_id } = req.body;
    const factoryId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO factories (id, name, location, company_id) VALUES (?, ?, ?, ?)',
      [factoryId, name, location, company_id]
    );
    res.status(201).json({ id: factoryId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create factory' });
  }
};

export const updateFactory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    await pool.query(
      'UPDATE factories SET name = ?, location = ? WHERE id = ?',
      [name, location, id]
    );
    res.json({ message: 'Factory updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update factory' });
  }
};

export const deleteFactory = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM factories WHERE id = ?', [id]);
    res.json({ message: 'Factory deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete factory' });
  }
};
