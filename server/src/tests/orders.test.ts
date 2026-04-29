import request from 'supertest';
import app from '../index';
import { businessesDb, menusDb, ordersDb } from '../db';

describe('Orders & Webhook API', () => {
  let bizId = '';
  const createdOrderIds: string[] = [];
  const createdMenuIds: string[] = [];

  beforeAll(() => {
    const biz = businessesDb.create({
      slug: 'order-biz',
      name: 'Order Biz',
      themeColor: '#000',
      secondaryColor: '#fff',
      whatsappNumber: '+111',
      location: 'City',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    bizId = biz.id;

    const m1 = menusDb.create({ businessId: bizId, title: 'Burger', description: '', price: 5, category: 'Food', isAvailable: true });
    const m2 = menusDb.create({ businessId: bizId, title: 'Juice', description: '', price: 2, category: 'Drink', isAvailable: true });
    createdMenuIds.push(m1.id, m2.id);
  });

  afterEach(() => {
    createdOrderIds.forEach((id) => ordersDb.delete(id));
    createdOrderIds.length = 0;
  });

  afterAll(() => {
    createdOrderIds.forEach((id) => ordersDb.delete(id));
    createdMenuIds.forEach((id) => menusDb.delete(id));
    businessesDb.delete(bizId);
  });

  test('GET list orders for business', async () => {
    const res = await request(app).get(`/api/businesses/${bizId}/orders`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST creates order with auto-calculated total', async () => {
    const res = await request(app)
      .post(`/api/businesses/${bizId}/orders`)
      .send({
        customerName: 'Alice',
        phone: '+123',
        items: [
          { menuId: '1', title: 'Pie', price: 3, qty: 2 },
          { menuId: '2', title: 'Soda', price: 1, qty: 1 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.customerName).toBe('Alice');
    expect(res.body.totalAmount).toBe(7);
    expect(res.body.status).toBe('pending');
    createdOrderIds.push(res.body.id);
  });

  test('GET specific order', async () => {
    const createRes = await request(app)
      .post(`/api/businesses/${bizId}/orders`)
      .send({ customerName: 'Bob', phone: '+456', items: [{ title: 'Tea', price: 2, qty: 1 }] });
    createdOrderIds.push(createRes.body.id);

    const res = await request(app).get(`/api/businesses/${bizId}/orders/${createRes.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createRes.body.id);
  });

  test('PATCH updates order status', async () => {
    const createRes = await request(app)
      .post(`/api/businesses/${bizId}/orders`)
      .send({ customerName: 'Charlie', phone: '+789', items: [{ title: 'Cake', price: 4, qty: 1 }] });
    createdOrderIds.push(createRes.body.id);

    const res = await request(app)
      .patch(`/api/businesses/${bizId}/orders/${createRes.body.id}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });

  test('Webhook parses message and creates order', async () => {
    const res = await request(app)
      .post('/api/webhook/n8n')
      .send({ customerPhone: '+999', message: 'Burger x2, Juice x1', businessId: bizId });
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.totalAmount).toBe(12); // (5*2)+(2*1)=12
    createdOrderIds.push(res.body.id);
  });
});
