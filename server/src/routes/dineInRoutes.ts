import { Router } from 'express';
import { DineInController } from '../controllers/dineInController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/restaurant/:restaurantId/tables', DineInController.getTables);
router.get('/table/:tableId/qr', DineInController.generateTableQR);
router.post('/table/verify-qr', DineInController.verifyTableQR);
router.post('/restaurant/:restaurantId/book', optionalAuth, DineInController.bookTable);
router.get('/my-bookings', authenticate, DineInController.getMyBookings);
router.post('/restaurant/:restaurantId/waitlist', optionalAuth, DineInController.joinWaitlist);
router.post('/waiter/request', DineInController.requestWaiterAssistance);

export default router;
