/**
 * Seed script — populate sample data for sandbox testing
 *
 * Usage:
 *   npx ts-node server/scripts/seed.ts
 *
 * Creates:
 *   - 2 businesses (Joviva Foods, Kofi Corner)
 *   - 4 menu items each
 *   - 1 sample order
 */

import { businessesDb, menusDb, ordersDb, socialsDb } from '../src/db';

function now() {
  return new Date().toISOString();
}

async function seed() {
  console.log('Seeding...');

  // Clear existing
  businessesDb.getAll().forEach((b) => businessesDb.delete(b.id));
  menusDb.getAll().forEach((m) => menusDb.delete(m.id));
  ordersDb.getAll().forEach((o) => ordersDb.delete(o.id));

  // Business 1: Joviva Foods
  const joviva = businessesDb.create({
    slug: 'joviva-foods',
    name: 'Joviva Foods',
    themeColor: '#E63946',
    secondaryColor: '#F1FAEE',
    whatsappNumber: '+971501234567',
    location: 'Al Qusais, Dubai',
    createdAt: now(),
    updatedAt: now(),
  });

  const jovivaMenus = [
    { businessId: joviva.id, title: 'Jollof Rice', description: 'Spicy Ghana-style with chicken', price: 15, category: 'Mains', isAvailable: true },
    { businessId: joviva.id, title: 'Grilled Tilapia', description: 'Fresh fish with pepper sauce', price: 25, category: 'Mains', isAvailable: true },
    { businessId: joviva.id, title: 'Kelewele', description: 'Spicy fried plantain cubes', price: 10, category: 'Sides', isAvailable: true },
    { businessId: joviva.id, title: 'Tsofi', description: 'Fried turkey tail', price: 12, category: 'Sides', isAvailable: false },
  ];

  jovivaMenus.forEach((m) => menusDb.create(m));

  // Business 2: Kofi Corner
  const kofi = businessesDb.create({
    slug: 'kofi-corner',
    name: 'Kofi Corner',
    themeColor: '#2A9D8F',
    secondaryColor: '#E9C46A',
    whatsappNumber: '+971509876543',
    location: 'Deira, Dubai',
    createdAt: now(),
    updatedAt: now(),
  });

  const kofiMenus = [
    { businessId: kofi.id, title: 'Cappuccino', description: 'Freshly brewed with foam art', price: 18, category: 'Coffee', isAvailable: true },
    { businessId: kofi.id, title: 'Croissant', description: 'Butter pastry', price: 8, category: 'Pastry', isAvailable: true },
    { businessId: kofi.id, title: 'Pancakes', description: 'Stack of 3 with maple syrup', price: 22, category: 'Breakfast', isAvailable: true },
    { businessId: kofi.id, title: 'Fresh Juice', description: 'Orange or mango', price: 12, category: 'Drinks', isAvailable: true },
  ];

  kofiMenus.forEach((m) => menusDb.create(m));

  // Sample order
  ordersDb.create({
    businessId: joviva.id,
    customerName: 'Kwaku',
    phone: '+971***0000',
    items: [
      { menuId: '', title: 'Jollof Rice', qty: 2, price: 15 },
      { menuId: '', title: 'Kelewele', qty: 1, price: 10 },
    ],
    totalAmount: 40,
    status: 'pending',
    createdAt: now(),
  });

  console.log(`✅ Seeded ${businessesDb.getAll().length} businesses, ${menusDb.getAll().length} menus, ${ordersDb.getAll().length} orders`);
  console.log(`   Storefront: http://localhost:5173/business/${joviva.slug}`);
}

seed().catch(console.error);
