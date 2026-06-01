import { NavLink, Outlet } from 'react-router-dom';
import { Boxes, LayoutDashboard, Menu, Package, ShoppingCart, Users } from 'lucide-react';
import { useState } from 'react';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[248px_1fr]">
      <aside className={`${open ? 'block' : 'hidden'} border-r border-line bg-white lg:block`}>
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand text-white">
            <Boxes size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold">Inventory OS</p>
            <p className="text-xs text-slate-500">Stock and orders</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  isActive ? 'bg-brand text-white' : 'text-slate-600 hover:bg-surface hover:text-ink'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur lg:px-8">
          <button className="btn btn-secondary lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-ink">Inventory & Order Management</h1>
            <p className="hidden text-sm text-slate-500 sm:block">Inventory, customers, orders, and stock alerts.</p>
          </div>
          <div className="hidden rounded-md border border-line bg-surface px-3 py-2 text-xs font-semibold text-slate-600 sm:block">
            FastAPI + React
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
