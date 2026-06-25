// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).flatten().fieldErrors;
      return res.status(422).json({ success: false, message: 'Validation failed', errors });
    }
    req.body = result.data; // replace with parsed + coerced data
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = (result.error as ZodError).flatten().fieldErrors;
      return res.status(422).json({ success: false, message: 'Invalid query params', errors });
    }
    req.query = result.data;
    next();
  };
}
