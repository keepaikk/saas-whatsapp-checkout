import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrders, getBusinesses } from '../../lib/api';
import { Order, Business } from '../../types';

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
};

export default function AdminOrders() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Order['status'] | 'all'>('all');

  useEffect(() => {
    if (!id) return;
    getBusinesses().then((all) => {
      const biz = all.find((b) => b.id === id);
      if (biz) setBusiness(biz);
    });
    getOrders(id).then(setOrders).catch(console.error);
  }, [id]);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          {business && <p className="text-sm text-gray-500">{business.name}</p>}
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'confirmed', 'delivered'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-sm border transition ${
                filter === s ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Customer', 'Phone', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{o.customerName}</td>
                <td className="px-4 py-3">{o.phone}</td>
                <td className="px-4 py-3">{o.items.map((i) => `${i.title} x${i.qty}`).join(', ')}</td>
                <td className="px-4 py-3 font-bold">${o.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No orders.</p>}
      </div>
    </div>
  );
}
