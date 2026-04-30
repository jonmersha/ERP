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
    const { companyId } = req.query;
    let query = 'SELECT * FROM production_runs';
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
      factoryId: row.factory_id,
      productId: row.product_id,
      recipeId: row.recipe_id,
      quantityPlanned: row.quantity_planned,
      quantityProduced: row.quantity_produced,
      startDate: row.start_date,
      createdAt: row.created_at
    }));
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch production runs' });
  }
};

export const createProductionRun = async (req, res) => {
  try {
    const { id, factory_id, product_id, recipe_id, quantity_planned, quantity_produced, status, start_date, company_id } = req.body;
    const runId = id || crypto.randomUUID();
    const formattedStartDate = start_date ? new Date(start_date).toISOString().slice(0, 19).replace('T', ' ') : null;

    await pool.query(
      'INSERT INTO production_runs (id, factory_id, product_id, recipe_id, quantity_planned, quantity_produced, status, start_date, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [runId, factory_id, product_id, recipe_id, quantity_planned, quantity_produced, status, formattedStartDate, company_id]
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
    const formattedStartDate = start_date ? new Date(start_date).toISOString().slice(0, 19).replace('T', ' ') : null;

    await pool.query(
      'UPDATE production_runs SET factory_id = ?, product_id = ?, recipe_id = ?, quantity_planned = ?, quantity_produced = ?, status = ?, start_date = ? WHERE id = ?',
      [factory_id, product_id, recipe_id, quantity_planned, quantity_produced, status, formattedStartDate, id]
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
