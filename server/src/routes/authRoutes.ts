import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, AuthController.registerCustomer);
router.post('/login', authRateLimiter, AuthController.login);
router.post('/manager-login', authRateLimiter, AuthController.managerLoginWithCode);
router.get('/staff/:restaurantId', AuthController.getRestaurantStaff);
router.post('/staff', AuthController.createStaffMember);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);

export default router;
