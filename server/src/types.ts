/**
 * Core types for the WhatsApp Checkout SaaS
 */

export interface Business {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  faviconUrl?: string;
  themeColor: string;
  secondaryColor: string;
  whatsappNumber: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  businessId: string;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  isAvailable: boolean;
}

export interface CartItem {
  menuId: string;
  title: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  businessId: string;
  customerName: string;
  phone: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
}

export interface SocialLink {
  id: string;
  businessId: string;
  platform: string;
  url: string;
}
