import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/production:
 *   get:
 *     summary: Retrieve list of production runs
 *     responses:
 *       200:
 *         description: Production runs list
 *   post:
 *     summary: Create a new production run
 *     responses:
 *       201:
 *         description: Production run created
 * /api/production/{id}:
 *   put:
 *     summary: Update a production run
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Production run updated
 *   delete:
 *     summary: Delete a production run
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Production run deleted
 */
export const getAllProductionRuns = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM production_runs');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch production runs' });
  }
};

export const createProductionRun = async (req, res) => {
  try {
    const { id, factory_id, product_id, recipe_id, quantity_planned, quantity_produced, status, start_date, company_id } = req.body;
    const runId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO production_runs (id, factory_id, product_id, recipe_id, quantity_planned, quantity_produced, status, start_date, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [runId, factory_id, product_id, recipe_id, quantity_planned, quantity_produced, status, start_date, company_id]
    );
    res.status(201).json({ id: runId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create production run' });
  }
};

export const updateProductionRun = async (req, res) => {
  try {
    const { id } = req.params;
    const { factory_id, product_id, recipe_id, quantity_planned, quantity_produced, status, start_date } = req.body;
    await pool.query(
      'UPDATE production_runs SET factory_id = ?, product_id = ?, recipe_id = ?, quantity_planned = ?, quantity_produced = ?, status = ?, start_date = ? WHERE id = ?',
      [factory_id, product_id, recipe_id, quantity_planned, quantity_produced, status, start_date, id]
    );
    res.json({ message: 'Production run updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update production run' });
  }
};

export const deleteProductionRun = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM production_runs WHERE id = ?', [id]);
    res.json({ message: 'Production run deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete production run' });
  }
};
