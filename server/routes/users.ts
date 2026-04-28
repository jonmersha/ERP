import { Router } from 'express';
import { db } from '../firebase';

const router = Router();

// Get all users for a company
router.get('/', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const snapshot = await db.collection('users')
      .where('companyId', '==', companyId)
      .orderBy('name', 'asc')
      .get();

    const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
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

    await db.collection('users').doc(uid).update({ roles });
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
    const doc = await db.collection('companies').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error: any) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
