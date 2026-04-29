import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2 } from 'lucide-react';

const nav = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Businesses', path: '/admin/businesses', icon: Building2 },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-5 text-xl font-bold text-gray-800">Admin</div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((n) => {
            const active = pathname === n.path || pathname.startsWith(n.path + '/');
            return (
              <Link
                key={n.path}
                to={n.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <n.icon size={18} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
