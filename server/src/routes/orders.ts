import { Router, Request, Response } from 'express';
import { businessesDb, ordersDb, menusDb } from '../db';

const router = Router({ mergeParams: true });

// GET list orders for business
router.get('/', (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }
  const items = ordersDb.getAll().filter((o) => o.businessId === businessId);
  res.json(items);
});

// GET specific order
router.get('/:orderId', (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const orderId = req.params.orderId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }
  const order = ordersDb.getById(orderId);
  if (!order || order.businessId !== businessId) { res.status(404).json({ error: 'Order not found' }); return; }
  res.json(order);
});

// POST create order
router.post('/', (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }

  const { customerName, phone, items } = req.body;
  if (!customerName || !phone || !Array.isArray(items)) {
    res.status(400).json({ error: 'Missing required fields: customerName, phone, items' });
    return;
  }

  const totalAmount = items.reduce(
    (sum: number, it: any) => sum + (Number(it.price) * Number(it.qty || 1)),
    0
  );

  const order = ordersDb.create({
    businessId,
    customerName,
    phone,
    items: items.map((it: any) => ({
      menuId: it.menuId ?? '',
      title: it.title ?? '',
      price: Number(it.price ?? 0),
      qty: Number(it.qty ?? 1),
    })),
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(order);
});

// PATCH update order status
router.patch('/:orderId', (req: Request, res: Response) => {
  const businessId = req.params.businessId as string;
  const orderId = req.params.orderId as string;
  const business = businessesDb.getById(businessId);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }

  const existing = ordersDb.getById(orderId);
  if (!existing || existing.businessId !== businessId) { res.status(404).json({ error: 'Order not found' }); return; }

  const { status } = req.body;
  if (!status || !['pending', 'confirmed', 'delivered'].includes(status)) {
    res.status(400).json({ error: 'Invalid status (pending, confirmed, delivered)' });
    return;
  }
  const updated = ordersDb.update(orderId, { status });
  res.json(updated);
});

export default router;
