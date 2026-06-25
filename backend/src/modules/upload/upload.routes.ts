// src/modules/upload/upload.routes.ts
import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../../middleware/auth';
import { adminOnly } from '../../middleware/adminOnly';

const router = Router();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Поддерживаются только JPG и PNG'));
  },
});

router.post('/image', authenticate, adminOnly,
  upload.single('image'),
  (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Файл не выбран' }) as any;
    res.json({ success: true, data: { url: `/uploads/products/${req.file.filename}` } });
  }
);

export default router;
