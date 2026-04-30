import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/suppliers:
 *   get:
 *     summary: Retrieve list of suppliers
 *     responses:
 *       200:
 *         description: A list of suppliers
 *   post:
 *     summary: Create a new supplier
 *     responses:
 *       201:
 *         description: Supplier created
 * /api/suppliers/{id}:
 *   put:
 *     summary: Update a supplier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplier updated
 *   delete:
 *     summary: Delete a supplier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplier deleted
 */
export const getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
};

export const createSupplier = async (req, res) => {
  try {
    const { id, name, contact, email, company_id } = req.body;
    const supplierId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO suppliers (id, name, contact, email, company_id) VALUES (?, ?, ?, ?, ?)',
      [supplierId, name, contact, email, company_id]
    );
    res.status(201).json({ id: supplierId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, email } = req.body;
    await pool.query(
      'UPDATE suppliers SET name = ?, contact = ?, email = ? WHERE id = ?',
      [name, contact, email, id]
    );
    res.json({ message: 'Supplier updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
};
