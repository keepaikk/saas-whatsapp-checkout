import { MapPin, Phone } from 'lucide-react';
import type { Business } from '../types';

export default function StoreHeader({ business }: { business: Business }) {
  return (
    <header className="relative bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] text-white p-6 pb-12">
      <div className="max-w-6xl mx-auto flex items-center gap-4">
        {business.logoUrl ? (
          <img src={business.logoUrl} alt={business.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/30" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {business.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80 mt-1">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {business.location}
            </span>
            <a href={`tel:${business.whatsappNumber}`} className="flex items-center gap-1 hover:text-white">
              <Phone size={14} /> {business.whatsappNumber}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
