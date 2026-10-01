import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.post('/', authenticate, ReviewController.submitReview);
router.post('/:id/reply', authenticate, requireRole(['manager', 'admin']), ReviewController.replyToReview);

export default router;
