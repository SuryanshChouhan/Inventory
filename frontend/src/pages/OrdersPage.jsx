import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Minus, Plus, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getCustomers } from '../api/customers';
import { createOrder, deleteOrder, getOrders } from '../api/orders';
import { getProducts } from '../api/products';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { currency, formatDate } from '../lib/format';

export default function OrdersPage() {
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [search, setSearch] = useState('');
  const [viewOrder, setViewOrder] = useState(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({ queryKey: ['orders'], queryFn: getOrders });
  const { data: products = [], isLoading: productsLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(term));
  }, [products, search]);

  const cartLines = cart
    .map((line) => ({ ...line, product: productMap.get(line.product_id) }))
    .filter((line) => line.product);

  const cartTotal = cartLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const hasInvalidStock = cartLines.some((line) => line.quantity > line.product.quantity);

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      ['orders', 'products', 'dashboard'].forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      setCart([]);
      toast.success('Order placed and stock updated');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Order deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    setCart((current) => {
      const existing = current.find((line) => line.product_id === product.id);
      if (!existing) return [...current, { product_id: product.id, quantity: 1 }];
      if (existing.quantity >= product.quantity) {
        toast.error(`Only ${product.quantity} units available`);
        return current;
      }
      return current.map((line) => (line.product_id === product.id ? { ...line, quantity: line.quantity + 1 } : line));
    });
  };

  const setCartQuantity = (productId, quantity) => {
    const product = productMap.get(productId);
    const nextQuantity = Math.max(1, Number(quantity) || 1);
    if (product && nextQuantity > product.quantity) {
      toast.error(`Only ${product.quantity} units available`);
    }
    setCart((current) =>
      current.map((line) =>
        line.product_id === productId ? { ...line, quantity: Math.min(nextQuantity, product?.quantity || nextQuantity) } : line,
      ),
    );
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((line) => line.product_id !== productId));
  };

  const placeOrder = (event) => {
    event.preventDefault();
    if (!customerId) {
      toast.error('Select a customer');
      return;
    }
    if (!cartLines.length) {
      toast.error('Add at least one product');
      return;
    }
    if (hasInvalidStock) {
      toast.error('Cart quantity exceeds available stock');
      return;
    }
    createMutation.mutate({
      customer_id: Number(customerId),
      items: cartLines.map((line) => ({ product_id: line.product_id, quantity: line.quantity })),
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Storefront Orders</h2>
          <p className="text-sm text-slate-500">Browse inventory, build a cart, and place stock-safe customer orders.</p>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-semibold">
          <ShoppingCart size={18} className="text-brand" aria-hidden="true" />
          {cartCount} items
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          <div className="panel p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <input
                className="field pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products or SKU"
              />
            </label>
          </div>

          {productsLoading ? (
            <p className="text-sm text-slate-500">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <EmptyState title="No products found" message="Add products in inventory or adjust your search." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />
              ))}
            </div>
          )}
        </div>

        <form className="panel h-fit overflow-hidden xl:sticky xl:top-20" onSubmit={placeOrder}>
          <div className="border-b border-line px-5 py-4">
            <h3 className="font-bold">Checkout Cart</h3>
            <p className="text-sm text-slate-500">Backend re-checks stock before every order.</p>
          </div>

          <div className="space-y-4 p-5">
            <label className="grid gap-1">
              <span className="label">Customer</span>
              <select className="field" value={customerId} onChange={(event) => setCustomerId(event.target.value)} required>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            </label>

            {cartLines.length === 0 ? (
              <div className="rounded-md border border-dashed border-line bg-surface p-5 text-center text-sm text-slate-500">
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-3">
                {cartLines.map((line) => (
                  <CartLine
                    key={line.product_id}
                    line={line}
                    onChange={(quantity) => setCartQuantity(line.product_id, quantity)}
                    onRemove={() => removeFromCart(line.product_id)}
                  />
                ))}
              </div>
            )}

            <div className="rounded-md border border-line bg-surface p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Items</span>
                <span className="font-semibold">{cartCount}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-lg font-bold">
                <span>Total</span>
                <span>{currency.format(cartTotal)}</span>
              </div>
            </div>

            <button className="btn btn-primary w-full" disabled={createMutation.isPending || !cartLines.length || hasInvalidStock}>
              <ShoppingCart size={18} /> Place Order
            </button>
          </div>
        </form>
      </div>

      <OrderHistory
        orders={orders}
        isLoading={ordersLoading}
        onView={setViewOrder}
        onDelete={(orderId) => deleteMutation.mutate(orderId)}
      />

      {viewOrder && <OrderDetailsModal order={viewOrder} onClose={() => setViewOrder(null)} />}
    </section>
  );
}

function ProductCard({ product, onAdd }) {
  const status = product.quantity === 0 ? 'Out of stock' : product.quantity < 10 ? 'Low stock' : 'Available';
  const statusClass = product.quantity === 0 ? 'bg-red-50 text-red-700' : product.quantity < 10 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700';

  return (
    <article className="panel overflow-hidden">
      <div className="flex aspect-[5/3] items-center justify-center bg-gradient-to-br from-slate-100 via-white to-teal-50">
        <div className="grid h-20 w-20 place-items-center rounded-md border border-line bg-white shadow-panel">
          <ShoppingCart className="text-brand" size={30} aria-hidden="true" />
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-bold">{product.name}</h3>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{product.sku}</p>
          </div>
          <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${statusClass}`}>{status}</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-bold">{currency.format(product.price)}</p>
            <p className="text-sm text-slate-500">{product.quantity} in stock</p>
          </div>
          <button className="btn btn-primary" onClick={onAdd} disabled={product.quantity === 0}>
            <Plus size={16} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}

function CartLine({ line, onChange, onRemove }) {
  const stockWarning = line.quantity > line.product.quantity;

  return (
    <div className={`rounded-md border p-3 ${stockWarning ? 'border-red-300 bg-red-50' : 'border-line bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{line.product.name}</p>
          <p className="text-xs text-slate-500">{currency.format(line.product.price)} each</p>
        </div>
        <button type="button" className="btn btn-secondary h-8 w-8 px-0" onClick={onRemove} aria-label="Remove item">
          <X size={15} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center rounded-md border border-line bg-white">
          <button type="button" className="grid h-9 w-9 place-items-center" onClick={() => onChange(line.quantity - 1)} aria-label="Decrease quantity">
            <Minus size={14} />
          </button>
          <input
            className="h-9 w-12 border-x border-line text-center text-sm font-semibold outline-none"
            type="number"
            min="1"
            max={line.product.quantity}
            value={line.quantity}
            onChange={(event) => onChange(event.target.value)}
          />
          <button type="button" className="grid h-9 w-9 place-items-center" onClick={() => onChange(line.quantity + 1)} aria-label="Increase quantity">
            <Plus size={14} />
          </button>
        </div>
        <p className="font-bold">{currency.format(line.product.price * line.quantity)}</p>
      </div>
      <p className={`mt-2 text-xs ${stockWarning ? 'text-red-700' : 'text-slate-500'}`}>
        {line.product.quantity} available
      </p>
    </div>
  );
}

function OrderHistory({ orders, isLoading, onView, onDelete }) {
  if (isLoading) return <p className="text-sm text-slate-500">Loading orders...</p>;
  if (orders.length === 0) {
    return <EmptyState title="No orders yet" message="Use the storefront above to create your first order." />;
  }

  return (
    <div className="panel overflow-x-auto">
      <div className="border-b border-line px-5 py-4">
        <h3 className="font-bold">Order History</h3>
      </div>
      <table className="w-full min-w-[760px]">
        <thead className="table-head">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="table-cell font-semibold">#{order.id}</td>
              <td className="table-cell">{order.customer?.name || `Customer ${order.customer_id}`}</td>
              <td className="table-cell">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
              <td className="table-cell">{currency.format(order.total)}</td>
              <td className="table-cell">{formatDate(order.created_at)}</td>
              <td className="table-cell">
                <div className="flex justify-end gap-2">
                  <button className="btn btn-secondary h-9 w-9 px-0" onClick={() => onView(order)} aria-label="View order">
                    <Eye size={16} />
                  </button>
                  <button className="btn btn-danger h-9 w-9 px-0" onClick={() => onDelete(order.id)} aria-label="Delete order">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderDetailsModal({ order, onClose }) {
  return (
    <Modal title={`Order #${order.id}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Info label="Customer" value={order.customer?.name || order.customer_id} />
          <Info label="Created" value={formatDate(order.created_at)} />
          <Info label="Total" value={currency.format(order.total)} />
        </div>
        <div className="overflow-x-auto rounded-md border border-line">
          <table className="w-full min-w-[520px]">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="table-cell font-semibold">{item.product?.name || item.product_id}</td>
                  <td className="table-cell">{item.quantity}</td>
                  <td className="table-cell">{currency.format(item.unit_price)}</td>
                  <td className="table-cell">{currency.format(item.quantity * item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-line bg-surface p-3">
      <p className="label">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
