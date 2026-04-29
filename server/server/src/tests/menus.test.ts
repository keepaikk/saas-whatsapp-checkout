import request from 'supertest';
import app from '../index';
import { businessesDb, menusDb } from '../db';

function makeBusiness() {
  return businessesDb.create({
    slug: `biz-${Date.now()}`,
    name: `Test Biz ${Date.now()}`,
    themeColor: '#000000',
    secondaryColor: '#ffffff',
    whatsappNumber: '12345',
    location: 'Earth',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

function makeMenuItem(businessId: string, overrides?: Partial<any>) {
  return menusDb.create({
    businessId,
    title: 'Burger',
    description: 'Juicy',
    price: 9.99,
    category: 'Food',
    isAvailable: true,
    ...overrides,
  });
}

describe('Menu CRUD API', () => {
  const createdMenuIds: string[] = [];
  const createdBusinessIds: string[] = [];

  afterEach(() => {
    createdMenuIds.forEach((id) => menusDb.delete(id));
    createdMenuIds.length = 0;
    createdBusinessIds.forEach((id) => businessesDb.delete(id));
    createdBusinessIds.length = 0;
  });

  test('GET /api/businesses/:businessId/menus lists menus for business', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);
    const item1 = makeMenuItem(biz.id, { title: 'Burger' });
    const item2 = makeMenuItem(biz.id, { title: 'Fries' });
    const other = makeMenuItem('other-biz-id', { title: 'Pizza' });
    createdMenuIds.push(item1.id, item2.id, other.id);

    const res = await request(app).get(`/api/businesses/${biz.id}/menus`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    const titles = res.body.map((m: any) => m.title).sort();
    expect(titles).toEqual(['Burger', 'Fries']);
  });

  test('POST creates menu item linked to business', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);

    const res = await request(app)
      .post(`/api/businesses/${biz.id}/menus`)
      .send({
        title: 'Salad',
        description: 'Fresh greens',
        price: 7.5,
        category: 'Food',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.businessId).toBe(biz.id);
    expect(res.body.title).toBe('Salad');
    expect(res.body.description).toBe('Fresh greens');
    expect(res.body.price).toBe(7.5);
    expect(res.body.category).toBe('Food');
    expect(res.body.isAvailable).toBe(true);
    createdMenuIds.push(res.body.id);
  });

  test('GET /api/businesses/:businessId/menus/:menuId returns specific item', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);
    const item = makeMenuItem(biz.id, { title: 'Pasta' });
    createdMenuIds.push(item.id);

    const res = await request(app).get(`/api/businesses/${biz.id}/menus/${item.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(item.id);
    expect(res.body.title).toBe('Pasta');
  });

  test('GET specific menu returns 404 if menu belongs to another business', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);
    const item = makeMenuItem(biz.id);
    createdMenuIds.push(item.id);

    const res = await request(app).get(`/api/businesses/other-biz/menus/${item.id}`);
    expect(res.status).toBe(404);
  });

  test('GET specific menu returns 404 for non-existent business', async () => {
    const res = await request(app).get(`/api/businesses/nonexistent/menus/123`);
    expect(res.status).toBe(404);
  });

  test('PATCH updates menu item', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);
    const item = makeMenuItem(biz.id, { title: 'Soda' });
    createdMenuIds.push(item.id);

    const res = await request(app)
      .patch(`/api/businesses/${biz.id}/menus/${item.id}`)
      .send({ price: 2.99, isAvailable: false });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(2.99);
    expect(res.body.isAvailable).toBe(false);
  });

  test('PATCH returns 404 if menu belongs to another business', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);
    const item = makeMenuItem(biz.id);
    createdMenuIds.push(item.id);

    const res = await request(app)
      .patch(`/api/businesses/other-biz/menus/${item.id}`)
      .send({ price: 1.0 });

    expect(res.status).toBe(404);
  });

  test('DELETE removes menu item', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);
    const item = makeMenuItem(biz.id);
    createdMenuIds.push(item.id);

    const delRes = await request(app).delete(`/api/businesses/${biz.id}/menus/${item.id}`);
    expect(delRes.status).toBe(204);
    createdMenuIds.pop();

    const getRes = await request(app).get(`/api/businesses/${biz.id}/menus/${item.id}`);
    expect(getRes.status).toBe(404);
  });

  test('DELETE returns 404 if menu belongs to another business', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);
    const item = makeMenuItem(biz.id);
    createdMenuIds.push(item.id);

    const res = await request(app).delete(`/api/businesses/other-biz/menus/${item.id}`);
    expect(res.status).toBe(404);
  });

  test('image upload sets imageUrl', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);
    const item = makeMenuItem(biz.id, { title: 'Cake' });
    createdMenuIds.push(item.id);

    const res = await request(app)
      .post(`/api/businesses/${biz.id}/menus/${item.id}/image`)
      .attach('image', Buffer.from('fake-image'), 'cake.png');

    expect(res.status).toBe(200);
    expect(res.body.imageUrl).toMatch(/^\/uploads\/products\//);
  });

  test('image upload returns 404 if menu belongs to another business', async () => {
    const biz = makeBusiness();
    createdBusinessIds.push(biz.id);
    const item = makeMenuItem(biz.id);
    createdMenuIds.push(item.id);

    const res = await request(app)
      .post(`/api/businesses/other-biz/menus/${item.id}/image`)
      .attach('image', Buffer.from('fake-image'), 'img.png');

    expect(res.status).toBe(404);
  });
});
