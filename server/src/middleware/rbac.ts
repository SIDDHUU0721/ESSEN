import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../models/User';
import { RestaurantStaff } from '../models/RestaurantStaff';
import { Restaurant } from '../models/Restaurant';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.userRole || 'anonymous'}`,
        },
      });
      return;
    }
    next();
  };
};

/**
 * Restaurant Authorization verification middleware
 * Ensures manager / waiter is genuinely bound to the requested restaurant.
 */
export const requireRestaurantAccess = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Platform Admin has platform-wide authority
    if (req.userRole === 'admin') {
      return next();
    }

    const requestedRestaurantId = req.params.restaurantId || req.params.id || req.body.restaurantId || req.query.restaurantId;

    if (!requestedRestaurantId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_RESTAURANT_ID', message: 'Restaurant identifier is required.' },
      });
      return;
    }

    // Check staff record
    const staff = await RestaurantStaff.findOne({
      user: req.userId,
      restaurant: requestedRestaurantId,
      isActive: true,
    });

    if (!staff) {
      res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_RESTAURANT_ACCESS',
          message: 'You do not have staff or manager permissions for this restaurant.',
        },
      });
      return;
    }

    req.restaurantId = requestedRestaurantId.toString();
    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { code: 'AUTH_VERIFICATION_ERROR', message: error.message },
    });
  }
};
