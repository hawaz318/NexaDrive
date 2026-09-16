import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthUser } from '../types/express';

export interface TokenPayload extends AuthUser {
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: AuthUser): string => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    config.jwt.refreshSecret,
    { expiresIn: '7d' }
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
};
