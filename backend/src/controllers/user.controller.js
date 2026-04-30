import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve a user by id
 *     responses:
 *       200:
 *         description: User found
 *   put:
 *     summary: Update a user
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete a user
 *     responses:
 *       200:
 *         description: User deleted
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     responses:
 *       201:
 *         description: User created
 */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM users WHERE uid = ?', [id]);
    if (rows.length > 0) {
      const user = rows[0];
      // map snake_case to camelCase
      user.companyId = user.company_id;
      user.unitId = user.unit_id;
      res.json(user);
    } else {
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { uid, email, name, roles, unit_id, unitId, company_id, companyId } = req.body;
    const finalUnitId = unit_id || unitId || null;
    const finalCompanyId = company_id || companyId || null;
    
    await pool.query(
      'INSERT INTO users (uid, email, name, roles, unit_id, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [uid, email, name, JSON.stringify(roles), finalUnitId, finalCompanyId]
    );
    res.status(201).json({ uid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, roles, unit_id, unitId, company_id, companyId } = req.body;
    const finalUnitId = unit_id || unitId || null;
    const finalCompanyId = company_id || companyId || null;
    
    // Optionally also update company_id if provided. Currently not in the query below, adding it.
    await pool.query(
      'UPDATE users SET email = ?, name = ?, roles = ?, unit_id = ?, company_id = ? WHERE uid = ?',
      [email, name, JSON.stringify(roles), finalUnitId, finalCompanyId, id]
    );
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('DELETE FROM users WHERE uid = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
