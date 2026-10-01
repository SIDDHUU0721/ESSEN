import { Router } from 'express';
import { MenuController } from '../controllers/menuController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/restaurant/:restaurantId', MenuController.getMenuByRestaurant);
router.post('/restaurant/:restaurantId/category', authenticate, requireRole(['manager', 'admin']), MenuController.createCategory);
router.post('/restaurant/:restaurantId/item', authenticate, requireRole(['manager', 'admin']), MenuController.addMenuItem);
router.put('/item/:id', authenticate, requireRole(['manager', 'admin']), MenuController.updateMenuItem);

export default router;
