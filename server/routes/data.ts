
import { Router } from 'express';
import { getStorage } from '../services/dbFactory.js';

export const dataRouter = Router();

dataRouter.get('/:collection', async (req, res) => {
    const { collection } = req.params;
    const { companyId } = req.query;
    
    try {
        const storage = getStorage();
        const data = await storage.find(collection, { companyId });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

dataRouter.post('/:collection', async (req, res) => {
    const { collection } = req.params;
    const data = req.body;
    
    try {
        const storage = getStorage();
        const result = await storage.create(collection, data);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

dataRouter.patch('/:collection/:id', async (req, res) => {
    const { collection, id } = req.params;
    const data = req.body;
    
    try {
        const storage = getStorage();
        const result = await storage.update(collection, id, data);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});
