import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurantController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/', optionalAuth, RestaurantController.discoverRestaurants);
router.get('/dishes/search', RestaurantController.searchDishes);
router.post('/sample-seed', optionalAuth, RestaurantController.seedSampleRestaurants);
router.get('/:id', optionalAuth, RestaurantController.getRestaurantById);
router.post('/', optionalAuth, RestaurantController.registerRestaurant);
router.patch('/:id/status', optionalAuth, RestaurantController.updateStatus);

export default router;

