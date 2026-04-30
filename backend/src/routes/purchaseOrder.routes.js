import { Router } from 'express';
import { getAllPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from '../controllers/purchaseOrder.controller.js';

const router = Router();

router.get('/plans', getAllPurchaseOrders);
router.get('/', getAllPurchaseOrders);
router.post('/', createPurchaseOrder);
router.put('/:id', updatePurchaseOrder);
router.delete('/:id', deletePurchaseOrder);

export default router;
