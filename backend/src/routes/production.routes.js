import { Router } from 'express';
import { getAllProductionRuns, createProductionRun, updateProductionRun, deleteProductionRun } from '../controllers/production.controller.js';
import { getAllProductionPlans, createProductionPlan, updateProductionPlan, deleteProductionPlan } from '../controllers/productionPlan.controller.js';
import { getAllRecipes, createRecipe, updateRecipe, deleteRecipe } from '../controllers/recipe.controller.js';

const router = Router();

router.get('/plans', getAllProductionPlans);
router.post('/plans', createProductionPlan);
router.put('/plans/:id', updateProductionPlan);
router.delete('/plans/:id', deleteProductionPlan);

router.get('/recipes', getAllRecipes);
router.post('/recipes', createRecipe);
router.put('/recipes/:id', updateRecipe);
router.delete('/recipes/:id', deleteRecipe);

router.get('/', getAllProductionRuns);
router.post('/', createProductionRun);
router.put('/:id', updateProductionRun);
router.delete('/:id', deleteProductionRun);

export default router;
