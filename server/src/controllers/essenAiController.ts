import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EssenEngine } from '../ai/essenEngine';

export class EssenAiController {
  public static async query(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, conversationHistory, restaurantId } = req.body;

      if (!query || typeof query !== 'string' || query.trim() === '') {
        res.status(400).json({
          success: false,
          error: { code: 'EMPTY_QUERY', message: 'Query string is required.' },
        });
        return;
      }

      const response = await EssenEngine.processQuery({
        query,
        userId: req.userId,
        userRole: req.userRole || 'customer',
        restaurantId: restaurantId || req.restaurantId,
        conversationHistory,
      });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}
