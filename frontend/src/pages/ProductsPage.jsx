import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Edit, MapPin, PackageCheck, PackageX, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api/products';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { currency } from '../lib/format';

const blankProduct = {
  name: '',
  sku: '',
  price: '',
  quantity: '',
  category: 'General',
  location: 'Unassigned',
  reorder_level: 10,
  max_stock: 100,
  supplier: '',
  notes: '',
};

const statusOptions = ['All', 'Out', 'Low', 'Healthy', 'High'];

export default function ProductsPage() {
  const [modal, setModal] = useState(null);
  const [refillProduct, setRefillProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const saveMutation = useMutation({
    mutationFn: ({ id, values }) => (id ? updateProduct(id, values) : createProduct(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setModal(null);
      toast.success('Inventory item saved');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Inventory item deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const refillMutation = useMutation({
    mutationFn: ({ product, quantity }) => updateProduct(product.id, { quantity: product.quantity + quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setRefillProduct(null);
      setSearchParams({});
      toast.success('Stock refilled');
    },
    onError: (error) => toast.error(error.message),
  });

  const enrichedProducts = useMemo(() => data.map((product) => ({ ...product, status: getStockStatus(product) })), [data]);

  useEffect(() => {
    const refillId = Number(searchParams.get('refill'));
    if (!refillId || data.length === 0) return;
    const product = data.find((item) => item.id === refillId);
    if (product) {
      setRefillProduct(product);
      setStatusFilter('Out');
    }
  }, [data, searchParams]);
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return enrichedProducts.filter((product) => {
      const haystack = `${product.name} ${product.sku} ${product.category} ${product.location} ${product.supplier || ''}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesStatus = statusFilter === 'All' || product.status.label === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enrichedProducts, search, statusFilter]);

  const summary = useMemo(() => {
    const totalUnits = data.reduce((sum, product) => sum + product.quantity, 0);
    const totalValue = data.reduce((sum, product) => sum + product.quantity * product.price, 0);
    const low = enrichedProducts.filter((product) => product.status.label === 'Low').length;
    const out = enrichedProducts.filter((product) => product.status.label === 'Out').length;
    const high = enrichedProducts.filter((product) => product.status.label === 'High').length;
    return { totalUnits, totalValue, low, out, high };
  }, [data, enrichedProducts]);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Inventory Management</h2>
          <p className="text-sm text-slate-500">Track stock levels, storage locations, suppliers, and reorder alerts.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ values: blankProduct })}>
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <InventoryMetric icon={PackageCheck} label="Stock Units" value={summary.totalUnits} tone="text-brand" />
        <InventoryMetric icon={PackageCheck} label="Inventory Value" value={currency.format(summary.totalValue)} tone="text-mint" />
        <InventoryMetric icon={AlertTriangle} label="Low Stock" value={summary.low} tone="text-amber" />
        <InventoryMetric icon={PackageX} label="Out / High" value={`${summary.out} / ${summary.high}`} tone="text-red-600" />
      </div>

      <div className="panel p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
            <input
              className="field pl-10"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, SKU, category, location, or supplier"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`btn h-10 ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading inventory...</p>
      ) : filteredProducts.length === 0 ? (
        <EmptyState title="No inventory items found" message="Add items or adjust your search and stock filters." />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[1120px]">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Reorder / Max</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <InventoryRow
                  key={product.id}
                  product={product}
                  onEdit={() => setModal({ id: product.id, values: product })}
                  onRefill={() => setRefillProduct(product)}
                  onDelete={() => deleteMutation.mutate(product.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ProductModal
          initialValues={modal.values}
          isSaving={saveMutation.isPending}
          onClose={() => setModal(null)}
          onSubmit={(values) => saveMutation.mutate({ id: modal.id, values })}
        />
      )}

      {refillProduct && (
        <RefillModal
          product={refillProduct}
          isSaving={refillMutation.isPending}
          onClose={() => {
            setRefillProduct(null);
            setSearchParams({});
          }}
          onSubmit={(quantity) => refillMutation.mutate({ product: refillProduct, quantity })}
        />
      )}
    </section>
  );
}

function InventoryMetric({ icon: Icon, label, value, tone }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <Icon className={tone} size={20} aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function InventoryRow({ product, onEdit, onRefill, onDelete }) {
  return (
    <tr>
      <td className="table-cell">
        <p className="font-semibold">{product.name}</p>
        <p className="text-xs text-slate-500">{product.sku} · {product.category}</p>
        {product.notes ? <p className="mt-1 max-w-xs truncate text-xs text-slate-500">{product.notes}</p> : null}
      </td>
      <td className="table-cell">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-md px-2 py-1 text-xs font-bold ${product.status.className}`}>{product.status.label}</span>
          {product.status.label === 'Out' ? (
            <button className="btn btn-primary h-8 px-2 text-xs" onClick={onRefill}>
              <Plus size={14} /> Add Stock
            </button>
          ) : null}
        </div>
      </td>
      <td className="table-cell">
        <p className="font-bold">{product.quantity}</p>
        <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full ${product.status.barClassName}`} style={{ width: `${stockPercent(product)}%` }} />
        </div>
      </td>
      <td className="table-cell">{product.reorder_level} / {product.max_stock}</td>
      <td className="table-cell">
        <span className="inline-flex items-center gap-1">
          <MapPin size={14} className="text-slate-400" aria-hidden="true" />
          {product.location}
        </span>
      </td>
      <td className="table-cell">{product.supplier || '—'}</td>
      <td className="table-cell">{currency.format(product.quantity * product.price)}</td>
      <td className="table-cell">
        <div className="flex justify-end gap-2">
          <button className="btn btn-secondary h-9 w-9 px-0" onClick={onEdit} aria-label="Edit inventory item">
            <Edit size={16} />
          </button>
          <button className="btn btn-danger h-9 w-9 px-0" onClick={onDelete} aria-label="Delete inventory item">
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductModal({ initialValues, isSaving, onClose, onSubmit }) {
  const [values, setValues] = useState({ ...blankProduct, ...initialValues });

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      name: values.name.trim(),
      sku: values.sku.trim(),
      price: Number(values.price),
      quantity: Number(values.quantity),
      category: values.category.trim(),
      location: values.location.trim(),
      reorder_level: Number(values.reorder_level),
      max_stock: Number(values.max_stock),
      supplier: (values.supplier || '').trim() || null,
      notes: (values.notes || '').trim() || null,
    });
  };

  return (
    <Modal title={initialValues.id ? 'Edit Inventory Item' : 'Add Inventory Item'} onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={values.name} onChange={(name) => setValues({ ...values, name })} required />
          <Input label="SKU" value={values.sku} onChange={(sku) => setValues({ ...values, sku })} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Category" value={values.category} onChange={(category) => setValues({ ...values, category })} required />
          <Input label="Location" value={values.location} onChange={(location) => setValues({ ...values, location })} required />
          <Input label="Supplier" value={values.supplier || ''} onChange={(supplier) => setValues({ ...values, supplier })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Input label="Price" type="number" min="0" step="0.01" value={values.price} onChange={(price) => setValues({ ...values, price })} required />
          <Input label="Quantity" type="number" min="0" step="1" value={values.quantity} onChange={(quantity) => setValues({ ...values, quantity })} required />
          <Input label="Reorder Level" type="number" min="0" step="1" value={values.reorder_level} onChange={(reorder_level) => setValues({ ...values, reorder_level })} required />
          <Input label="Max Stock" type="number" min="0" step="1" value={values.max_stock} onChange={(max_stock) => setValues({ ...values, max_stock })} required />
        </div>
        <label className="grid gap-1">
          <span className="label">Notes</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            value={values.notes || ''}
            onChange={(event) => setValues({ ...values, notes: event.target.value })}
          />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={isSaving}>Save</button>
        </div>
      </form>
    </Modal>
  );
}

function RefillModal({ product, isSaving, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState(product.reorder_level || 10);
  const projectedQuantity = product.quantity + Number(quantity || 0);

  const submit = (event) => {
    event.preventDefault();
    onSubmit(Number(quantity));
  };

  return (
    <Modal title={`Add Stock: ${product.name}`} onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <div className="rounded-md border border-line bg-surface p-4">
          <p className="text-sm text-slate-500">Current stock</p>
          <p className="mt-1 text-3xl font-bold text-red-600">{product.quantity}</p>
          <p className="mt-2 text-sm text-slate-500">Location: <span className="font-semibold text-ink">{product.location}</span></p>
          <p className="text-sm text-slate-500">Supplier: <span className="font-semibold text-ink">{product.supplier || 'Not set'}</span></p>
        </div>
        <Input
          label="Quantity To Add"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={setQuantity}
          required
        />
        <div className="rounded-md border border-line bg-white p-4">
          <p className="text-sm text-slate-500">Projected stock after refill</p>
          <p className="mt-1 text-2xl font-bold">{Number.isFinite(projectedQuantity) ? projectedQuantity : product.quantity}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={isSaving || Number(quantity) <= 0}>
            <Plus size={16} /> Add Stock
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Input({ label, value, onChange, ...props }) {
  return (
    <label className="grid gap-1">
      <span className="label">{label}</span>
      <input className="field" value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </label>
  );
}

function getStockStatus(product) {
  if (product.quantity === 0) return { label: 'Out', className: 'bg-red-50 text-red-700', barClassName: 'bg-red-500' };
  if (product.quantity <= product.reorder_level) return { label: 'Low', className: 'bg-amber-50 text-amber-700', barClassName: 'bg-amber-500' };
  if (product.quantity >= product.max_stock) return { label: 'High', className: 'bg-blue-50 text-blue-700', barClassName: 'bg-blue-500' };
  return { label: 'Healthy', className: 'bg-green-50 text-green-700', barClassName: 'bg-green-500' };
}

function stockPercent(product) {
  if (!product.max_stock) return 0;
  return Math.max(4, Math.min(100, Math.round((product.quantity / product.max_stock) * 100)));
}
