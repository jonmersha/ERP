import { Router } from 'express';
import { getStorage } from "../services/dbFactory.js";

const router = Router();

// Get all users for a company
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const storage = getStorage();
    const users = await storage.find('users', { 
      companyId: companyId as string,
      orderByField: 'name',
      orderDir: 'asc'
    });

    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user roles
router.patch('/:uid/roles', async (req, res) => {
  try {
    const { uid } = req.params;
    const { roles } = req.body;

    const storage = getStorage();
    await storage.update('users', uid, { roles });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user roles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get company details
router.get('/company/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const storage = getStorage();
    const result = await storage.findOne('companies', id);
    
    if (!result) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(result);
  } catch (error: any) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
