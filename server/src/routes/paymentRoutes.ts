import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.post('/initiate', authenticate, PaymentController.initiatePayment);
router.get('/invoice/:orderId', PaymentController.getInvoiceByOrderId);
router.post('/refund', authenticate, PaymentController.requestRefund);
router.patch('/refund/:id', authenticate, requireRole(['manager', 'admin']), PaymentController.processRefund);

export default router;
