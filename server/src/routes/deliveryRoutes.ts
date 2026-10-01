import { Router } from 'express';
import { DeliveryController } from '../controllers/deliveryController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/order/:orderId', DeliveryController.getDeliveryByOrder);
router.patch('/:id/location', DeliveryController.updateLocation);
router.patch('/:id/pickup', authenticate, DeliveryController.pickupOrder);
router.post('/:id/verify-otp', DeliveryController.verifyDeliveryOtp);

export default router;
