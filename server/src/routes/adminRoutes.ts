import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/metrics', authenticate, requireRole(['admin']), AdminController.getPlatformMetrics);
router.patch('/restaurants/:id/verification', authenticate, requireRole(['admin']), AdminController.updateRestaurantVerification);
router.get('/audit-logs', authenticate, requireRole(['admin']), AdminController.getAuditLogs);

export default router;
