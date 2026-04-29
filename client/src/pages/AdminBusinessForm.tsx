import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { createBusiness, updateBusiness, getBusinesses } from '../lib/api';
import type { Business } from '../types';

export default function AdminBusinessForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<Partial<Business>>({
    name: '',
    themeColor: '#4CAF50',
    secondaryColor: '#FF9800',
    whatsappNumber: '',
    location: '',
  });

  useEffect(() => {
    if (!id) return;
    getBusinesses().then((all) => {
      const biz = all.find((b) => b.id === id) || all.find((b) => b.slug === id);
      if (biz) setForm(biz);
    });
  }, [id]);

  const handleChange = (k: keyof Business, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const slugify = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.whatsappNumber || !form.location) return;
    const body = {
      ...form,
      slug: isEdit ? form.slug : slugify(form.name),
      createdAt: form.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (isEdit && id) {
      await updateBusiness(id, body);
    } else {
      await createBusiness(body);
    }
    navigate('/admin/businesses');
  };

  return (
    <div>
      <button onClick={() => navigate('/admin/businesses')} className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-800">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Business' : 'New Business'}</h1>

      <form onSubmit={submit} className="bg-white rounded-lg border p-6 max-w-xl space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input value={form.name || ''} onChange={(e) => handleChange('name', e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.themeColor || '#4CAF50'} onChange={(e) => handleChange('themeColor', e.target.value)} className="w-10 h-10 p-0 border rounded cursor-pointer" />
              <input value={form.themeColor || ''} onChange={(e) => handleChange('themeColor', e.target.value)} className="flex-1 border rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.secondaryColor || '#FF9800'} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="w-10 h-10 p-0 border rounded cursor-pointer" />
              <input value={form.secondaryColor || ''} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="flex-1 border rounded px-3 py-2" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
          <input value={form.whatsappNumber || ''} onChange={(e) => handleChange('whatsappNumber', e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input value={form.location || ''} onChange={(e) => handleChange('location', e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>

        <button type="submit" className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition mt-2">
          <Save size={16} /> {isEdit ? 'Save Changes' : 'Create Business'}
        </button>
      </form>
    </div>
  );
}
