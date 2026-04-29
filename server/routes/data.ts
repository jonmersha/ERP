
import { Router } from 'express';
import { getStorage } from '../services/dbFactory';

export const dataRouter = Router();

dataRouter.get('/:collection', async (req, res) => {
    const { collection } = req.params;
    console.log(`[GET] /api/data/${collection}`, req.query);
    
    try {
        const storage = getStorage();
        // Pass all query parameters to find
        const data = await storage.find(collection, req.query);
        res.json(data);
    } catch (err) {
        console.error(`[GET ERROR] ${collection}:`, err);
        res.status(500).json({ error: 'Database error', details: err instanceof Error ? err.message : String(err) });
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

dataRouter.delete('/:collection/:id', async (req, res) => {
    const { collection, id } = req.params;
    
    try {
        const storage = getStorage();
        if ('delete' in storage && typeof storage.delete === 'function') {
            await storage.delete(collection, id);
            res.json({ success: true });
        } else {
            res.status(501).json({ error: 'Delete not implemented for this storage' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});
