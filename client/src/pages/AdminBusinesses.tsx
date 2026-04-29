import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, UtensilsCrossed, ClipboardList } from 'lucide-react';
import { getBusinesses, deleteBusiness } from '../lib/api';
import type { Business } from '../types';

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    getBusinesses().then(setBusinesses).catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this business?')) return;
    await deleteBusiness(id);
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Businesses</h1>
        <Link
          to="/admin/businesses/new"
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition"
        >
          <Plus size={16} /> New Business
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Logo', 'Name', 'Slug', 'WhatsApp', 'Location', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {b.logoUrl ? (
                    <img src={b.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 text-gray-500">{b.slug}</td>
                <td className="px-4 py-3">{b.whatsappNumber}</td>
                <td className="px-4 py-3 text-gray-500">{b.location}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/businesses/${b.id}/menus`}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Menus"
                    >
                      <UtensilsCrossed size={16} />
                    </Link>
                    <Link
                      to={`/admin/businesses/${b.id}/orders`}
                      className="p-2 hover:bg-gray-100 rounded"
                      title="Orders"
                    >
                      <ClipboardList size={16} />
                    </Link>
                    <Link to={`/admin/businesses/${b.id}`} className="p-2 hover:bg-gray-100 rounded" title="Edit">
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {businesses.length === 0 && (
          <p className="text-center text-gray-400 py-8">No businesses yet.{" "}
            <Link to="/admin/businesses/new" className="underline">Create one.</Link>
          </p>
        )}
      </div>
    </div>
  );
}
