import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UserModel } from '../../database/models/user.model';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded: any = jwt.verify(token, config.jwtSecret);
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.locals.user = user; // Attach user to the response locals
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// New Authorization Middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(res.locals.user.role)) {
      return res.status(403).json({ message: `User role ${res.locals.user.role} is not authorized to access this route` });
    }
    next();
  };
};