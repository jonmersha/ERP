import pool from '../db.js';
import crypto from 'node:crypto';

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Retrieve list of products
 *     responses:
 *       200:
 *         description: A list of products
 *   post:
 *     summary: Create a new product
 *     responses:
 *       201:
 *         description: Product created
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */
export const getAllProducts = async (req, res) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM products';
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
      packageSize: row.package_size
    }));
    res.json(mappedRows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { id, name, category, package_size, unit, price, company_id } = req.body;
    const productId = id || crypto.randomUUID();
    await pool.query(
      'INSERT INTO products (id, name, category, package_size, unit, price, company_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [productId, name, category, package_size, unit, price, company_id]
    );
    res.status(201).json({ id: productId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, package_size, unit, price } = req.body;
    await pool.query(
      'UPDATE products SET name = ?, category = ?, package_size = ?, unit = ?, price = ? WHERE id = ?',
      [name, category, package_size, unit, price, id]
    );
    res.json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
