import { JsonDb, businessesDb } from '../db';
import { Business } from '../types';
import fs from 'fs';
import path from 'path';

const TEST_FILE = path.join(__dirname, '../../data/db-test-businesses.json');

describe('JsonDb<Business>', () => {
  let db: JsonDb<Business>;

  beforeEach(() => {
    // Ensure clean state: remove any existing test data file
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
    }
    db = new JsonDb<Business>('db-test-businesses');
  });

  afterEach(() => {
    if (fs.existsSync(TEST_FILE)) {
      fs.unlinkSync(TEST_FILE);
    }
  });

  test('create returns item with generated id', () => {
    const item = db.create({
      slug: 'acme',
      name: 'Acme Co',
      themeColor: '#000000',
      secondaryColor: '#ffffff',
      whatsappNumber: '12345',
      location: 'Earth',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(item.id).toBeDefined();
    expect(typeof item.id).toBe('string');
    expect(item.name).toBe('Acme Co');
  });

  test('getAll returns all items', () => {
    db.create({
      slug: 'a',
      name: 'A',
      themeColor: '#000',
      secondaryColor: '#fff',
      whatsappNumber: '1',
      location: 'L1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });
    db.create({
      slug: 'b',
      name: 'B',
      themeColor: '#000',
      secondaryColor: '#fff',
      whatsappNumber: '2',
      location: 'L2',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    });
    expect(db.getAll()).toHaveLength(2);
  });

  test('getById works', () => {
    const created = db.create({
      slug: 'c',
      name: 'C',
      themeColor: '#000',
      secondaryColor: '#fff',
      whatsappNumber: '3',
      location: 'L3',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });
    expect(db.getById(created.id)).toEqual(created);
    expect(db.getById('nonexistent')).toBeUndefined();
  });

  test('update works', () => {
    const created = db.create({
      slug: 'd',
      name: 'D',
      themeColor: '#000',
      secondaryColor: '#fff',
      whatsappNumber: '4',
      location: 'L4',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });
    const updated = db.update(created.id, { name: 'D-Updated' });
    expect(updated).toBeDefined();
    expect(updated!.name).toBe('D-Updated');
    expect(db.getById(created.id)!.name).toBe('D-Updated');
  });

  test('delete works', () => {
    const created = db.create({
      slug: 'e',
      name: 'E',
      themeColor: '#000',
      secondaryColor: '#fff',
      whatsappNumber: '5',
      location: 'L5',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });
    expect(db.delete(created.id)).toBe(true);
    expect(db.getById(created.id)).toBeUndefined();
    expect(db.delete('nonexistent')).toBe(false);
  });

  test('file is written after create', () => {
    db.create({
      slug: 'f',
      name: 'F',
      themeColor: '#000',
      secondaryColor: '#fff',
      whatsappNumber: '6',
      location: 'L6',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });
    expect(fs.existsSync(TEST_FILE)).toBe(true);
    const raw = fs.readFileSync(TEST_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('F');
  });
});

describe('Singleton DBs', () => {
  test('businessesDb is an instance of JsonDb', () => {
    expect(businessesDb).toBeInstanceOf(JsonDb);
  });
});
