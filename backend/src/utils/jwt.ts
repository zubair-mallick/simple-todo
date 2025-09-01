import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (userId: Types.ObjectId, email: string): string => {
  const payload: JWTPayload = {
    userId: userId.toString(),
    email
  };

  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateRefreshToken = (userId: Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    { userId: userId.toString(), type: 'refresh' },
    secret,
    { expiresIn: '30d' }
  );
};
