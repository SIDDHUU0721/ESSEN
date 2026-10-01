import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  errors?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred on the server.';

  // Never leak internal stack traces to clients
  console.error(`[Error] ${errorCode} (${statusCode}):`, err.message);

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(err.errors ? { details: err.errors } : {}),
    },
  });
};
