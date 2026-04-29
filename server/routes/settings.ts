
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

export const settingsRouter = Router();

settingsRouter.get('/backend', (req, res) => {
    try {
        const configPath = path.resolve(process.cwd(), 'app-config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        res.json({ activeBackend: config.activeBackend });
    } catch (e) {
        res.json({ activeBackend: 'firebase' });
    }
});

settingsRouter.post('/backend', (req, res) => {
    const { mode } = req.body;
    if (mode !== 'firebase' && mode !== 'sql') {
        return res.status(400).json({ error: 'Invalid mode' });
    }
    
    try {
        const configPath = path.resolve(process.cwd(), 'app-config.json');
        const config = { activeBackend: mode };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        res.json({ success: true, activeBackend: mode });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update config' });
    }
});
