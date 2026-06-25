// src/utils/jwt.ts
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  };
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  };
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;
}

export async function generateTokenPair(payload: { userId: string; role: string }) {
  const jwtPayload = { sub: payload.userId, role: payload.role };
  const accessToken  = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);
  return { accessToken, refreshToken };
}
