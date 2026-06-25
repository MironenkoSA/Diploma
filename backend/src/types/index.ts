// src/types/index.ts
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export function paginate(page: string | undefined, limit: string | undefined) {
  const p = Math.max(1, parseInt(page || '1'));
  const l = Math.min(100, Math.max(1, parseInt(limit || '12')));
  return { skip: (p - 1) * l, take: l, page: p, limit: l };
}
