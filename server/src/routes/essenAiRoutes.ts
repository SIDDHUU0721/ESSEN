import { Router } from 'express';
import { EssenAiController } from '../controllers/essenAiController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/query', optionalAuth, EssenAiController.query);

export default router;
