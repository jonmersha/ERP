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
    const { uid } = req.params;
    const [rows] = await pool.query('SELECT * FROM users WHERE uid = ?', [uid]);
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { uid, email, name, roles, unit_id, company_id } = req.body;
    await pool.query(
      'INSERT INTO users (uid, email, name, roles, unit_id, company_id) VALUES (?, ?, ?, ?, ?, ?)',
      [uid, email, name, JSON.stringify(roles), unit_id, company_id]
    );
    res.status(201).json({ uid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const { email, name, roles, unit_id } = req.body;
    await pool.query(
      'UPDATE users SET email = ?, name = ?, roles = ?, unit_id = ? WHERE uid = ?',
      [email, name, JSON.stringify(roles), unit_id, uid]
    );
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    await pool.query('DELETE FROM users WHERE uid = ?', [uid]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
