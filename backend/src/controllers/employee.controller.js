import pool from '../db.js';
import crypto from 'node:crypto';

export const getAllEmployees = async (req, res) => {
  try {
    const { companyId } = req.query;
    let query = 'SELECT * FROM employees';
    let params = [];
    if (companyId) {
      query += ' WHERE company_id = ?';
      params.push(companyId);
    }
    const [rows] = await pool.query(query, params);
    
    // map snake_case to camelCase
    const mappedRows = rows.map(row => ({
      ...row,
      factoryId: row.factory_id,
      companyId: row.company_id,
      hireDate: row.hire_date
    }));
    
    res.json(mappedRows);
  } catch (error) {
    console.error('Fetch employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, email, department, role, salary, factoryId, hireDate, companyId } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO employees (id, name, email, department, role, salary, factory_id, hire_date, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, department, role, salary, factoryId, hireDate || new Date(), companyId]
    );
    res.status(201).json({ id });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, role, salary, factoryId, hireDate } = req.body;
    await pool.query(
      'UPDATE employees SET name = ?, email = ?, department = ?, role = ?, salary = ?, factory_id = ?, hire_date = ? WHERE id = ?',
      [name, email, department, role, salary, factoryId, hireDate, id]
    );
    res.json({ message: 'Employee updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM employees WHERE id = ?', [id]);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};
