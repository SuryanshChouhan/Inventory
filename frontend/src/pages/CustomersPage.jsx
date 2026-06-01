import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Mail, Phone, Plus, ShoppingBag, Trash2, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../api/customers';
import { getOrders } from '../api/orders';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { currency, formatDate } from '../lib/format';

const blankCustomer = { name: '', email: '', phone: '' };

export default function CustomersPage() {
  const [modal, setModal] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const queryClient = useQueryClient();
  const { data: customers = [], isLoading } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const { data: orders = [], isLoading: ordersLoading } = useQuery({ queryKey: ['orders'], queryFn: getOrders });

  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const saveMutation = useMutation({
    mutationFn: ({ id, values }) => (id ? updateCustomer(id, values) : createCustomer(values)),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedCustomerId(customer.id);
      setModal(null);
      toast.success('Customer saved');
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setSelectedCustomerId(null);
      toast.success('Customer deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || customers[0];
  const ordersByCustomer = useMemo(() => {
    return orders.reduce((groups, order) => {
      groups[order.customer_id] = groups[order.customer_id] || [];
      groups[order.customer_id].push(order);
      return groups;
    }, {});
  }, [orders]);
  const selectedOrders = selectedCustomer ? ordersByCustomer[selectedCustomer.id] || [] : [];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Customers</h2>
          <p className="text-sm text-slate-500">Open a customer to see every ordered product, order total, and contact detail.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ values: blankCustomer })}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading customers...</p>
      ) : customers.length === 0 ? (
        <EmptyState title="No customers yet" message="Create a customer before placing an order." />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="panel overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h3 className="font-bold">Customer List</h3>
            </div>
            <div className="divide-y divide-line">
              {customers.map((customer) => {
                const customerOrders = ordersByCustomer[customer.id] || [];
                const isSelected = selectedCustomer?.id === customer.id;
                return (
                  <button
                    key={customer.id}
                    className={`block w-full px-5 py-4 text-left transition ${isSelected ? 'bg-teal-50' : 'bg-white hover:bg-surface'}`}
                    onClick={() => setSelectedCustomerId(customer.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-bold">{customer.name}</p>
                        <p className="truncate text-sm text-slate-500">{customer.email}</p>
                      </div>
                      <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-600">
                        {customerOrders.length} orders
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedCustomer ? (
            <CustomerDetail
              customer={selectedCustomer}
              orders={selectedOrders}
              ordersLoading={ordersLoading}
              onEdit={() => setModal({ id: selectedCustomer.id, values: selectedCustomer })}
              onDelete={() => deleteMutation.mutate(selectedCustomer.id)}
            />
          ) : null}
        </div>
      )}

      {modal && (
        <CustomerModal
          initialValues={modal.values}
          isSaving={saveMutation.isPending}
          onClose={() => setModal(null)}
          onSubmit={(values) => saveMutation.mutate({ id: modal.id, values })}
        />
      )}
    </section>
  );
}

function CustomerDetail({ customer, orders, ordersLoading, onEdit, onDelete }) {
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const totalProducts = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  return (
    <div className="space-y-5">
      <div className="panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserRound className="text-brand" size={22} aria-hidden="true" />
              <h3 className="text-lg font-bold">{customer.name}</h3>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Mail size={16} aria-hidden="true" /> {customer.email}</p>
              <p className="flex items-center gap-2"><Phone size={16} aria-hidden="true" /> {customer.phone || 'No phone added'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={onEdit}>
              <Edit size={16} /> Edit
            </button>
            <button className="btn btn-danger" onClick={onDelete}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <CustomerMetric label="Orders" value={orders.length} />
          <CustomerMetric label="Products Ordered" value={totalProducts} />
          <CustomerMetric label="Total Spent" value={currency.format(totalSpent)} />
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <ShoppingBag className="text-brand" size={20} aria-hidden="true" />
          <h3 className="font-bold">Ordered Products</h3>
        </div>
        {ordersLoading ? (
          <p className="p-5 text-sm text-slate-500">Loading customer orders...</p>
        ) : orders.length === 0 ? (
          <EmptyState title="No orders for this customer" message="Orders placed for this customer will appear here." />
        ) : (
          <div className="divide-y divide-line">
            {orders.map((order) => (
              <div key={order.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">Order #{order.id}</p>
                    <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                  </div>
                  <p className="text-lg font-bold">{currency.format(order.total)}</p>
                </div>
                <div className="mt-4 overflow-x-auto rounded-md border border-line">
                  <table className="w-full min-w-[560px]">
                    <thead className="table-head">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="table-cell font-semibold">{item.product?.name || `Product ${item.product_id}`}</td>
                          <td className="table-cell">{item.product?.sku || '-'}</td>
                          <td className="table-cell">{item.quantity}</td>
                          <td className="table-cell">{currency.format(item.unit_price)}</td>
                          <td className="table-cell">{currency.format(item.unit_price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CustomerMetric({ label, value }) {
  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function CustomerModal({ initialValues, isSaving, onClose, onSubmit }) {
  const [values, setValues] = useState({
    name: initialValues.name ?? '',
    email: initialValues.email ?? '',
    phone: initialValues.phone ?? '',
  });

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: (values.phone || '').trim() || null,
    });
  };

  return (
    <Modal title={initialValues.id ? 'Edit Customer' : 'Add Customer'} onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <Input label="Name" value={values.name} onChange={(name) => setValues({ ...values, name })} required />
        <Input label="Email" type="email" value={values.email} onChange={(email) => setValues({ ...values, email })} required />
        <Input label="Phone" value={values.phone} onChange={(phone) => setValues({ ...values, phone })} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={isSaving}>Save</button>
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
