import { Business, MenuItem, Order, SocialLink } from '../types';

const BASE = import.meta.env.VITE_API_URL || '';

export async function getBusinesses(): Promise<Business[]> {
  const res = await fetch(`${BASE}/api/businesses`);
  if (!res.ok) throw new Error('Failed to fetch businesses');
  return res.json();
}

export async function getBusiness(slug: string): Promise<Business> {
  const res = await fetch(`${BASE}/api/businesses/${slug}`);
  if (!res.ok) throw new Error('Business not found');
  return res.json();
}

export async function createBusiness(body: Partial<Business>): Promise<Business> {
  const res = await fetch(`${BASE}/api/businesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create business');
  return res.json();
}

export async function updateBusiness(id: string, body: Partial<Business>): Promise<Business> {
  const res = await fetch(`${BASE}/api/businesses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update business');
  return res.json();
}

export async function deleteBusiness(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/businesses/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete business');
}

export async function getMenus(businessId: string): Promise<MenuItem[]> {
  const res = await fetch(`${BASE}/api/businesses/${businessId}/menus`);
  if (!res.ok) throw new Error('Failed to fetch menus');
  return res.json();
}

export async function createMenu(businessId: string, body: Partial<MenuItem>): Promise<MenuItem> {
  const res = await fetch(`${BASE}/api/businesses/${businessId}/menus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create menu');
  return res.json();
}

export async function updateMenu(businessId: string, menuId: string, body: Partial<MenuItem>): Promise<MenuItem> {
  const res = await fetch(`${BASE}/api/businesses/${businessId}/menus/${menuId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update menu');
  return res.json();
}

export async function deleteMenu(businessId: string, menuId: string): Promise<void> {
  const res = await fetch(`${BASE}/api/businesses/${businessId}/menus/${menuId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete menu');
}

export async function createOrder(businessId: string, body: Partial<Order>): Promise<Order> {
  const res = await fetch(`${BASE}/api/businesses/${businessId}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}

export async function getOrders(businessId: string): Promise<Order[]> {
  const res = await fetch(`${BASE}/api/businesses/${businessId}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function updateOrderStatus(businessId: string, orderId: string, status: Order['status']): Promise<Order> {
  const res = await fetch(`${BASE}/api/businesses/${businessId}/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update order');
  return res.json();
}

export async function webhookN8n(payload: { customerPhone: string; message: string; businessId: string }): Promise<Order> {
  const res = await fetch(`${BASE}/api/webhook/n8n`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Webhook failed');
  return res.json();
}
