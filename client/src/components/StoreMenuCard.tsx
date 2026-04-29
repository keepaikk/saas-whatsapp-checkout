import { Plus } from 'lucide-react';
import type { MenuItem } from '../types';

export default function StoreMenuCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  if (!item.isAvailable) return null;

  return (
    <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] bg-gray-100 relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-bold">
            {item.title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800">{item.title}</h3>
        {item.description && <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[var(--primary-color)] font-bold">${item.price.toFixed(2)}</span>
          <button
            onClick={onAdd}
            className="bg-[var(--primary-color)] text-white p-2 rounded-full hover:opacity-90 transition"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
