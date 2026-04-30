import { Router } from 'express';
import { getAllProductionRuns, createProductionRun, updateProductionRun, deleteProductionRun } from '../controllers/production.controller.js';
import { getAllProductionPlans } from '../controllers/productionPlan.controller.js';

const router = Router();

router.get('/plans', getAllProductionPlans);
router.get('/', getAllProductionRuns);
router.post('/', createProductionRun);
router.put('/:id', updateProductionRun);
router.delete('/:id', deleteProductionRun);

export default router;
