import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/', optionalAuth, OrderController.createOrder);
router.get('/my-orders', authenticate, OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderById);
router.patch('/:id/status', authenticate, OrderController.updateOrderStatus);
router.post('/:id/cancel', optionalAuth, OrderController.cancelOrder);
router.get('/restaurant/:restaurantId', authenticate, OrderController.getRestaurantOrders);

export default router;
