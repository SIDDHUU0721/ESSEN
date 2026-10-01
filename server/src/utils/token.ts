import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRole } from '../models/User';

export const generateToken = (payload: { userId: string; role: UserRole; restaurantId?: string }): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwtSecret);
};
