import { Router } from 'express';
import { SupportController } from '../controllers/supportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, SupportController.createTicket);
router.get('/my-tickets', authenticate, SupportController.getMyTickets);
router.post('/:id/messages', authenticate, SupportController.addMessage);

export default router;
