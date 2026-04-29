import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { businessesDb } from '../db';

const router = Router();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', '..', 'public', 'uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(uploadDir, 'logos');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const id = req.params.id as string;
    const ts = Date.now();
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${id}-${ts}${ext}`);
  },
});

const faviconStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(uploadDir, 'favicons');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const id = req.params.id as string;
    const ts = Date.now();
    const ext = path.extname(file.originalname) || '.ico';
    cb(null, `${id}-${ts}${ext}`);
  },
});

const uploadLogo = multer({ storage: logoStorage });
const uploadFavicon = multer({ storage: faviconStorage });

// GET all
router.get('/', (_req: Request, res: Response) => {
  res.json(businessesDb.getAll());
});

// GET by slug
router.get('/:slug', (req: Request, res: Response) => {
  const business = businessesDb.getBySlug(req.params.slug as string);
  if (!business) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(business);
});

// POST create
router.post('/', (req: Request, res: Response) => {
  const { name, themeColor, secondaryColor, whatsappNumber, location } = req.body;
  if (!name || !themeColor || !secondaryColor || !whatsappNumber || !location) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  const now = new Date().toISOString();
  const business = businessesDb.create({
    slug: generateSlug(name),
    name,
    themeColor,
    secondaryColor,
    whatsappNumber,
    location,
    createdAt: now,
    updatedAt: now,
  });
  res.status(201).json(business);
});

// PATCH update
router.patch('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = businessesDb.getById(id);
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  const changes: any = { ...req.body, updatedAt: new Date().toISOString() };
  const updated = businessesDb.update(id, changes);
  res.json(updated);
});

// DELETE
router.delete('/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = businessesDb.getById(id);
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  businessesDb.delete(id);
  res.status(204).send();
});

// POST logo
router.post('/:id/logo', uploadLogo.single('logo'), (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = businessesDb.getById(id);
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
  const updated = businessesDb.update(id, {
    logoUrl: `/uploads/logos/${req.file.filename}`,
    updatedAt: new Date().toISOString(),
  });
  res.json(updated);
});

// POST favicon
router.post('/:id/favicon', uploadFavicon.single('favicon'), (req: Request, res: Response) => {
  const id = req.params.id as string;
  const existing = businessesDb.getById(id);
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
  const updated = businessesDb.update(id, {
    faviconUrl: `/uploads/favicons/${req.file.filename}`,
    updatedAt: new Date().toISOString(),
  });
  res.json(updated);
});

export default router;
