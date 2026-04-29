import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import { useTheme } from '../hooks/useTheme';
import { getMenus, createOrder } from '../lib/api';
import type { MenuItem } from '../types';
import StoreHeader from '../components/StoreHeader';
import StoreMenuCard from '../components/StoreMenuCard';
import StoreCart from '../components/StoreCart';

export default function Storefront() {
  const { slug } = useParams<{ slug: string }>();
  const { business, loading, error } = useBusiness(slug || '');
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{ menuId: string; title: string; price: number; qty: number }[]>([]);
  const [catFilter, setCatFilter] = useState('All');

  useEffect(() => {
    if (business) {
      getMenus(business.id).then(setMenus).catch(console.error);
    }
  }, [business?.id]);

  useTheme(business || null);

  const categories = ['All', ...Array.from(new Set(menus.map((m) => m.category)))];
  const filtered = catFilter === 'All' ? menus : menus.filter((m) => m.category === catFilter);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.menuId === item.id);
      if (existing) {
        return prev.map((p) => (p.menuId === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { menuId: item.id, title: item.title, price: item.price, qty: 1 }];
    });
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const checkout = async () => {
    if (!business || cart.length === 0) return;

    await createOrder(business.id, {
      customerName: 'Guest',
      phone: business.whatsappNumber,
      items: cart,
    });

    const messages = cart.map((i) => `- ${i.title} x${i.qty}`).join('%0A');
    const url = `https://wa.me/${business.whatsappNumber.replace(/\D/g, '')}?text=I%20want%20to%20order:%0A${messages}%0ATotal:%20$${total.toFixed(2)}`;
    window.open(url, '_blank');

    setCart([]);
  };

  if (loading) return <div className="p-8 text-center">Loading store...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Store not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      {business && <StoreHeader business={business} />}

      <div className="px-4 py-4 max-w-6xl mx-auto">
        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                catFilter === c
                  ? 'bg-[var(--primary-color)] text-white border-transparent'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <StoreMenuCard key={item.id} item={item} onAdd={() => addToCart(item)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">No items in this category.</p>
        )}
      </div>

      <StoreCart cart={cart} total={total} onCheckout={checkout} onClear={() => setCart([])} />
    </div>
  );
}
