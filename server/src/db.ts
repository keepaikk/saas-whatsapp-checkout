import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { Business, MenuItem, Order, SocialLink } from './types';

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', 'data');

export class JsonDb<T extends { id: string }> {
  private records: T[] = [];
  private filePath: string;

  constructor(private collectionName: string) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.reload();
  }

  getAll(): T[] {
    return this.records;
  }

  getById(id: string): T | undefined {
    return this.records.find((r) => r.id === id);
  }

  getBySlug(slug: string): T | undefined {
    return this.records.find((r) => (r as any).slug === slug);
  }

  create(item: Omit<T, 'id'> & { id?: string }): T {
    const record = { ...(item as any), id: item.id ?? randomUUID() } as T;
    this.records.push(record);
    this.persist();
    return record;
  }

  update(id: string, changes: Partial<T>): T | undefined {
    const index = this.records.findIndex((r) => r.id === id);
    if (index === -1) return undefined;
    this.records[index] = { ...this.records[index], ...changes };
    this.persist();
    return this.records[index];
  }

  delete(id: string): boolean {
    const index = this.records.findIndex((r) => r.id === id);
    if (index === -1) return false;
    this.records.splice(index, 1);
    this.persist();
    return true;
  }

  persist(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(this.records, null, 2), 'utf-8');
  }

  reload(): void {
    if (fs.existsSync(this.filePath)) {
      try {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.records = JSON.parse(data || '[]');
      } catch {
        this.records = [];
      }
    } else {
      this.records = [];
    }
  }
}

export const businessesDb = new JsonDb<Business>('businesses');
export const menusDb = new JsonDb<MenuItem>('menus');
export const ordersDb = new JsonDb<Order>('orders');
export const socialsDb = new JsonDb<SocialLink>('socials');
