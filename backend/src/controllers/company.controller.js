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
    const { code } = req.query;
    if (code) {
      const [rows] = await pool.query('SELECT * FROM companies WHERE code = ?', [code]);
      res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM companies');
      res.json(rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { id, name, code, address, phone, email, logo_url, banner_url, owner_id, logoUrl, bannerUrl, ownerId } = req.body;
    const companyId = id || crypto.randomUUID();
    
    const finalLogoUrl = logo_url || logoUrl || null;
    const finalBannerUrl = banner_url || bannerUrl || null;
    const finalOwnerId = owner_id || ownerId || null;

    await pool.query(
      'INSERT INTO companies (id, name, code, address, phone, email, logo_url, banner_url, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [companyId, name, code, address, phone, email, finalLogoUrl, finalBannerUrl, finalOwnerId]
    );
    res.status(201).json({ id: companyId });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Failed to create company', details: error.message });
  }
};

export const getCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM companies WHERE id = ?', [id]);
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, address, phone, email, logo_url, banner_url, owner_id, logoUrl, bannerUrl, ownerId } = req.body;
    
    const finalLogoUrl = logo_url || logoUrl || null;
    const finalBannerUrl = banner_url || bannerUrl || null;
    const finalOwnerId = owner_id || ownerId || null;

    await pool.query(
      'UPDATE companies SET name = ?, code = ?, address = ?, phone = ?, email = ?, logo_url = ?, banner_url = ?, owner_id = ? WHERE id = ?',
      [name, code, address, phone, email, finalLogoUrl, finalBannerUrl, finalOwnerId, id]
    );
    res.json({ message: 'Company updated' });
  } catch (error) {
    console.error('Update company error:', error);
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
