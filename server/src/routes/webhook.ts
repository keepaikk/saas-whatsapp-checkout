import { Router, Request, Response } from 'express';
import { businessesDb, ordersDb, menusDb } from '../db';

const router = Router();

function parseOrderText(text: string) {
  const items: { title: string; qty: number }[] = [];
  const regex = /([^x,]+)\s*x\s*(\d+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    items.push({ title: match[1].trim(), qty: Number(match[2]) });
  }
  return items;
}

// POST /api/webhook/n8n
router.post('/n8n', (req: Request, res: Response) => {
  const { customerPhone, message, businessId } = req.body;

  if (!customerPhone || !message || !businessId) {
    res.status(400).json({ error: 'Missing required fields: customerPhone, message, businessId' });
    return;
  }

  const business = businessesDb.getById(businessId as string);
  if (!business) { res.status(404).json({ error: 'Business not found' }); return; }

  const parsedItems = parseOrderText(message as string);
  if (parsedItems.length === 0) {
    res.status(400).json({ error: 'Could not parse order items from message' });
    return;
  }

  const orderItems = parsedItems.map((it) => {
    const menu = menusDb.getAll().find(
      (m) =>
        m.businessId === businessId &&
        m.title.toLowerCase().trim() === it.title.toLowerCase().trim()
    );
    return {
      menuId: menu?.id ?? '',
      title: it.title,
      qty: it.qty,
      price: menu?.price ?? 0,
    };
  });

  const totalAmount = orderItems.reduce((sum, it) => sum + it.price * it.qty, 0);

  const order = ordersDb.create({
    businessId,
    customerName: customerPhone as string,
    phone: customerPhone as string,
    items: orderItems,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(order);
});

export default router;
