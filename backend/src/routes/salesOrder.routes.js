import { Router } from 'express';
import { getAllSalesOrders, createSalesOrder, updateSalesOrder, deleteSalesOrder } from '../controllers/salesOrder.controller.js';

const router = Router();

router.get('/plans', getAllSalesOrders);
router.get('/', getAllSalesOrders);
router.post('/', createSalesOrder);
router.put('/:id', updateSalesOrder);
router.delete('/:id', deleteSalesOrder);

export default router;
