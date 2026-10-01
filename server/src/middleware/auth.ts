import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { config } from '../config/env';
import { User, IUser, UserRole } from '../models/User';
import { mockStore } from '../utils/mockDataStore';

export interface AuthRequest extends Request {
  user?: IUser | any;
  userId?: string;
  userRole?: UserRole;
  restaurantId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Missing token.' },
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: UserRole; restaurantId?: string };

    if (mongoose.connection.readyState !== 1) {
      const mockUser = mockStore.getUserById(decoded.userId) || {
        id: decoded.userId,
        _id: decoded.userId,
        name: 'Authenticated Partner',
        email: 'user@essen.com',
        role: decoded.role || 'manager',
        isActive: true,
      };
      req.user = mockUser;
      req.userId = decoded.userId;
      req.userRole = decoded.role || 'manager';
      if (decoded.restaurantId) {
        req.restaurantId = decoded.restaurantId;
      }
      return next();
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'User account not found or suspended.' },
      });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;
    if (decoded.restaurantId) {
      req.restaurantId = decoded.restaurantId;
    }

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session token.' },
    });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; role: UserRole; restaurantId?: string };
      
      if (mongoose.connection.readyState !== 1) {
        const mockUser = mockStore.getUserById(decoded.userId) || {
          id: decoded.userId,
          _id: decoded.userId,
          role: decoded.role || 'customer',
          isActive: true,
        };
        req.user = mockUser;
        req.userId = decoded.userId;
        req.userRole = decoded.role || 'customer';
        req.restaurantId = decoded.restaurantId;
        return next();
      }

      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id.toString();
        req.userRole = user.role;
        req.restaurantId = decoded.restaurantId;
      }
    }
    next();
  } catch {
    next();
  }
};

