import request from 'supertest';
import app from '../index';
import { businessesDb } from '../db';

describe('Business CRUD API', () => {
  const createdIds: string[] = [];

  afterEach(() => {
    createdIds.forEach((id) => businessesDb.delete(id));
    createdIds.length = 0;
  });

  test('GET /api/businesses returns 200 + array', async () => {
    const res = await request(app).get('/api/businesses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST creates business with proper slug', async () => {
    const res = await request(app)
      .post('/api/businesses')
      .send({
        name: 'Acme Inc',
        themeColor: '#ff0000',
        secondaryColor: '#00ff00',
        whatsappNumber: '+1234567890',
        location: 'New York',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.slug).toBe('acme-inc');
    expect(res.body.name).toBe('Acme Inc');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
    createdIds.push(res.body.id);
  });

  test('GET by slug works', async () => {
    const createRes = await request(app)
      .post('/api/businesses')
      .send({
        name: 'Beta Corp 123',
        themeColor: '#000000',
        secondaryColor: '#ffffff',
        whatsappNumber: '999',
        location: 'LA',
      });
    createdIds.push(createRes.body.id);

    const res = await request(app).get(`/api/businesses/${createRes.body.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createRes.body.id);
  });

  test('PATCH updates and sets updatedAt', async () => {
    const createRes = await request(app)
      .post('/api/businesses')
      .send({
        name: 'Gamma Ltd',
        themeColor: '#111',
        secondaryColor: '#222',
        whatsappNumber: '777',
        location: 'London',
      });
    createdIds.push(createRes.body.id);

    const originalUpdatedAt = createRes.body.updatedAt;
    await new Promise((r) => setTimeout(r, 50));

    const res = await request(app)
      .patch(`/api/businesses/${createRes.body.id}`)
      .send({ location: 'Berlin' });

    expect(res.status).toBe(200);
    expect(res.body.location).toBe('Berlin');
    expect(res.body.updatedAt).not.toBe(originalUpdatedAt);
  });

  test('DELETE removes business', async () => {
    const createRes = await request(app)
      .post('/api/businesses')
      .send({
        name: 'Delta Co',
        themeColor: '#333',
        secondaryColor: '#444',
        whatsappNumber: '555',
        location: 'Paris',
      });
    createdIds.push(createRes.body.id);

    const delRes = await request(app).delete(`/api/businesses/${createRes.body.id}`);
    expect(delRes.status).toBe(204);
    createdIds.pop();

    const getRes = await request(app).get(`/api/businesses/${createRes.body.slug}`);
    expect(getRes.status).toBe(404);
  });

  test('logo upload updates logoUrl', async () => {
    const createRes = await request(app)
      .post('/api/businesses')
      .send({
        name: 'Epsilon Logo',
        themeColor: '#555',
        secondaryColor: '#666',
        whatsappNumber: '333',
        location: 'Tokyo',
      });
    createdIds.push(createRes.body.id);

    const res = await request(app)
      .post(`/api/businesses/${createRes.body.id}/logo`)
      .attach('logo', Buffer.from('fake-image'), 'logo.png');

    expect(res.status).toBe(200);
    expect(res.body.logoUrl).toMatch(/^\/uploads\/logos\//);
  });
});
