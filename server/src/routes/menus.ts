import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { businessesDb, menusDb } from '../db';

const router = Router({ mergeParams: true });

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', '..', 'public', 'uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const productStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(uploadDir, 'products');
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const id = req.params.menuId as string;
    const ts = Date.now();
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${id}-${ts}${ext}`);
  },
});

const uploadProduct = multer({ storage: productStorage });

// GET list menus for business
router.get('/', (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }
  const items = menusDb.getAll().filter((m) => m.businessId === businessId);
  res.json(items);
});

// GET specific menu item
router.get('/:menuId', (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const menuId = req.params.menuId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }
  const item = menusDb.getById(menuId);
  if (!item || item.businessId !== businessId) { res.status(404).json({ error: 'Menu item not found' }); return; }
  res.json(item);
});

// POST create menu item
router.post('/', (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }

  const { title, description, price, category, isAvailable } = req.body;
  if (title == null || price == null || category == null) {
    res.status(400).json({ error: 'Missing required fields: title, price, category' });
    return;
  }

  const item = menusDb.create({
    businessId,
    title,
    description: description ?? '',
    price: Number(price),
    category,
    isAvailable: isAvailable !== false,
  });
  res.status(201).json(item);
});

// PATCH update menu item
router.patch('/:menuId', (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const menuId = req.params.menuId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }

  const existing = menusDb.getById(menuId);
  if (!existing || existing.businessId !== businessId) { res.status(404).json({ error: 'Menu item not found' }); return; }

  const changes: any = { ...req.body };
  if (changes.price != null) changes.price = Number(changes.price);
  const updated = menusDb.update(menuId, changes);
  res.json(updated);
});

// DELETE menu item
router.delete('/:menuId', (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const menuId = req.params.menuId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }

  const existing = menusDb.getById(menuId);
  if (!existing || existing.businessId !== businessId) { res.status(404).json({ error: 'Menu item not found' }); return; }

  menusDb.delete(menuId);
  res.status(204).send();
});

// POST upload product image
router.post('/:menuId/image', uploadProduct.single('image'), (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const menuId = req.params.menuId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }

  const existing = menusDb.getById(menuId);
  if (!existing || existing.businessId !== businessId) { res.status(404).json({ error: 'Menu item not found' }); return; }

  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  const updated = menusDb.update(menuId, {
    imageUrl: `/uploads/products/${req.file.filename}`,
  });
  res.json(updated);
});

export default router;
