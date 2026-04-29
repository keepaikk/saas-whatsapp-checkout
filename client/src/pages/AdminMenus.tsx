import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { getMenus, deleteMenu, createMenu } from '../lib/api';
import { getBusinesses } from '../lib/api';
import type { MenuItem, Business } from '../types';

export default function AdminMenus() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', category: '', isAvailable: true });

  useEffect(() => {
    if (!id) return;
    getBusinesses().then((all: Business[]) => {
      const biz = all.find((b: Business) => b.id === id);
      if (biz) setBusiness(biz);
    });
    getMenus(id).then(setMenus).catch(console.error);
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    await createMenu(id, {
      title: form.title,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      isAvailable: form.isAvailable,
    });
    setShowForm(false);
    setForm({ title: '', description: '', price: '', category: '', isAvailable: true });
    getMenus(id).then(setMenus);
  };

  const handleDelete = async (menuId: string) => {
    if (!id || !confirm('Delete this item?')) return;
    await deleteMenu(id, menuId);
    setMenus((prev) => prev.filter((m) => m.id !== menuId));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Menus</h1>
          {business && <p className="text-sm text-gray-500">{business.name}</p>}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition">
          <Plus size={16} /> {showForm ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border rounded-lg p-4 mb-6 max-w-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="border rounded px-3 py-2" required />
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" step="0.01" className="border rounded px-3 py-2" required />
          </div>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full border rounded px-3 py-2" />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full border rounded px-3 py-2" required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available
          </label>
          <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded">Create Item</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((m) => (
          <div key={m.id} className={`bg-white border rounded-lg overflow-hidden ${!m.isAvailable ? 'opacity-50' : ''}`}>
            <div className="aspect-[4/3] bg-gray-100 relative">
              {m.imageUrl ? (
                <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl font-bold">{m.title.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="text-xs text-gray-500">{m.category}{m.isAvailable ? '' : ' • Unavailable'}</p>
                  <p className="text-sm font-bold">${m.price.toFixed(2)}</p>
                </div>
                <button onClick={() => handleDelete(m.id)} className="p-1 hover:bg-red-50 text-red-500 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
