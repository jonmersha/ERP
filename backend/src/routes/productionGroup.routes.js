import { Router } from 'express';
import productionRoutes from './production.routes.js';
import productionPlanRoutes from './productionPlan.routes.js';

const router = Router();

router.use('/runs', productionRoutes);
router.use('/plans', productionPlanRoutes);
router.use('/', productionRoutes);

export default router;
