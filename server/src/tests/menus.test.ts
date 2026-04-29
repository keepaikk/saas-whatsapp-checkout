import request from 'supertest';
import app from '../index';
import { businessesDb, menusDb } from '../db';

describe('Menu CRUD API', () => {
  let bizId = '';
  const createdMenuIds: string[] = [];

  beforeAll(() => {
    const biz = businessesDb.create({
      slug: 'test-biz',
      name: 'Test Biz',
      themeColor: '#ff0000',
      secondaryColor: '#00ff00',
      whatsappNumber: '+123****7890',
      location: 'Test City',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    bizId = biz.id;
  });

  afterEach(() => {
    createdMenuIds.forEach((id) => menusDb.delete(id));
    createdMenuIds.length = 0;
  });

  afterAll(() => {
    businessesDb.delete(bizId);
  });

  test('GET list menus for business', async () => {
    const res = await request(app).get(`/api/businesses/${bizId}/menus`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST creates menu item linked to business', async () => {
    const res = await request(app)
      .post(`/api/businesses/${bizId}/menus`)
      .send({ title: 'Burger', price: 5.99, category: 'Food' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.businessId).toBe(bizId);
    expect(res.body.title).toBe('Burger');
    expect(res.body.isAvailable).toBe(true);
    createdMenuIds.push(res.body.id);
  });

  test('GET specific menu item', async () => {
    const createRes = await request(app)
      .post(`/api/businesses/${bizId}/menus`)
      .send({ title: 'Fries', price: 2.5, category: 'Sides' });
    createdMenuIds.push(createRes.body.id);

    const res = await request(app).get(`/api/businesses/${bizId}/menus/${createRes.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createRes.body.id);
  });

  test('PATCH updates menu item', async () => {
    const createRes = await request(app)
      .post(`/api/businesses/${bizId}/menus`)
      .send({ title: 'Soda', price: 1.5, category: 'Drinks' });
    createdMenuIds.push(createRes.body.id);

    const res = await request(app)
      .patch(`/api/businesses/${bizId}/menus/${createRes.body.id}`)
      .send({ price: 1.99, isAvailable: false });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(1.99);
    expect(res.body.isAvailable).toBe(false);
  });

  test('DELETE removes menu item', async () => {
    const createRes = await request(app)
      .post(`/api/businesses/${bizId}/menus`)
      .send({ title: 'Shake', price: 3.0, category: 'Dessert' });
    createdMenuIds.push(createRes.body.id);

    const delRes = await request(app).delete(`/api/businesses/${bizId}/menus/${createRes.body.id}`);
    expect(delRes.status).toBe(204);
    createdMenuIds.pop();

    const getRes = await request(app).get(`/api/businesses/${bizId}/menus/${createRes.body.id}`);
    expect(getRes.status).toBe(404);
  });

  test('image upload sets imageUrl', async () => {
    const createRes = await request(app)
      .post(`/api/businesses/${bizId}/menus`)
      .send({ title: 'Pizza', price: 8.0, category: 'Food' });
    createdMenuIds.push(createRes.body.id);

    const res = await request(app)
      .post(`/api/businesses/${bizId}/menus/${createRes.body.id}/image`)
      .attach('image', Buffer.from('fake-product'), 'product.png');
    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toMatch(/^\/uploads\/products\//);
  });
});
