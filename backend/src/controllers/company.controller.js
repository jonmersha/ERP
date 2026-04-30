import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/companies:
 *   get:
 *     summary: Retrieve list of companies
 *     responses:
 *       200:
 *         description: A list of companies
 *   post:
 *     summary: Create a new company
 *     responses:
 *       201:
 *         description: Company created
 * /api/companies/{id}:
 *   put:
 *     summary: Update a company
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company updated
 *   delete:
 *     summary: Delete a company
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company deleted
 */
export const getAllCompanies = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM companies');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { id, name, code, address, phone, email, logo_url, banner_url, owner_id } = req.body;
    const companyId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO companies (id, name, code, address, phone, email, logo_url, banner_url, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [companyId, name, code, address, phone, email, logo_url, banner_url, owner_id]
    );
    res.status(201).json({ id: companyId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create company' });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, phone, email, logo_url, banner_url, owner_id } = req.body;
    await pool.query(
      'UPDATE companies SET name = ?, code = ?, address = ?, phone = ?, email = ?, logo_url = ?, banner_url = ?, owner_id = ? WHERE id = ?',
      [name, code, address, phone, email, logo_url, banner_url, owner_id, id]
    );
    res.json({ message: 'Company updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company' });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM companies WHERE id = ?', [id]);
    res.json({ message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete company' });
  }
};
