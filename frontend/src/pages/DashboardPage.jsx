import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AlertTriangle, Boxes, DollarSign, Package, PackageX, Plus, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { getDashboard } from '../api/dashboard';
import EmptyState from '../components/EmptyState';
import { currency } from '../lib/format';

const cards = [
  { key: 'total_products', label: 'Products', icon: Package, color: 'text-brand' },
  { key: 'total_stock_units', label: 'Stock Units', icon: Boxes, color: 'text-mint' },
  { key: 'inventory_value', label: 'Inventory Value', icon: DollarSign, color: 'text-plum', format: currency.format },
  { key: 'total_orders', label: 'Orders', icon: ShoppingCart, color: 'text-brand' },
  { key: 'total_customers', label: 'Customers', icon: Users, color: 'text-mint' },
  { key: 'overstock_count', label: 'High Stock', icon: TrendingUp, color: 'text-blue-600' },
];

export default function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboard });

  if (isLoading) return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  if (isError) return <p className="text-sm text-red-600">{error.message}</p>;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ key, label, icon: Icon, color, format }) => (
          <div key={key} className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <Icon className={color} size={22} aria-hidden="true" />
            </div>
            <p className="mt-3 text-3xl font-bold">{format ? format(data[key]) : data[key]}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AlertPanel
          title="Out Of Stock"
          icon={PackageX}
          tone="text-red-600"
          products={data.out_of_stock_products}
          emptyTitle="No out-of-stock items"
          emptyMessage="Items with zero stock will appear here."
          action="refill"
        />
        <AlertPanel
          title="Low Stock Alerts"
          icon={AlertTriangle}
          tone="text-amber"
          products={data.low_stock_products}
          emptyTitle="No low-stock items"
          emptyMessage="Items at or below reorder level will appear here."
        />
        <AlertPanel
          title="High Stock"
          icon={TrendingUp}
          tone="text-blue-600"
          products={data.overstock_products}
          emptyTitle="No high-stock items"
          emptyMessage="Items at or above max stock will appear here."
        />
      </div>
    </section>
  );
}

function AlertPanel({ title, icon: Icon, tone, products, emptyTitle, emptyMessage, action }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon className={tone} size={20} aria-hidden="true" />
          <h2 className="font-bold">{title}</h2>
        </div>
        <span className="rounded-md bg-surface px-2 py-1 text-xs font-bold text-slate-600">{products.length}</span>
      </div>
      {products.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : (
        <div className="divide-y divide-line">
          {products.slice(0, 6).map((product) => (
            <div key={product.id} className="p-4">
              {action === 'refill' ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{product.name}</p>
                    <span className="mt-1 inline-flex rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700">Out of stock</span>
                  </div>
                  <Link className="btn btn-primary" to={`/inventory?refill=${product.id}`}>
                    <Plus size={16} /> Refill
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sku} - {product.category}</p>
                    </div>
                    <p className={`text-lg font-bold ${tone}`}>{product.quantity}</p>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-500">
                    <p>Location: <span className="font-semibold text-ink">{product.location}</span></p>
                    <p>Reorder / Max: <span className="font-semibold text-ink">{product.reorder_level} / {product.max_stock}</span></p>
                    <p>Supplier: <span className="font-semibold text-ink">{product.supplier || 'Not set'}</span></p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
