import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/manager/:restaurantId', authenticate, requireRole(['manager', 'admin']), AnalyticsController.getManagerDashboardAnalytics);

export default router;
