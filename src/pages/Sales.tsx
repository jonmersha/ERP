import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSalesData } from '../hooks/useSalesData';
import { createSalesOrder, updateSalesOrder, updateSalesOrderStatus } from '../services/salesService';
import { SalesOrder, SalesOrderItem } from '../types';
import { Store, ShoppingBag, CreditCard, Plus, Search, FileText, Loader2, Trash2, CheckCircle, Truck, XCircle } from 'lucide-react';
import Modal from '../components/Modal';
import StatsCard from '../components/common/StatsCard';
import Badge from '../components/common/Badge';

const Sales: React.FC = () => {
  const { profile } = useAuth();
  const { orders, products, outlets, loading } = useSalesData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);

  const [form, setForm] = useState<{
    outletId: string;
    items: SalesOrderItem[];
    status: SalesOrder['status'];
    createdAt: string;
  }>({
    outletId: '',
    items: [{ productId: '', productName: '', quantity: 0, price: 0 }],
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOrder) {
        await updateSalesOrder(editingOrder.id, form, outlets);
      } else {
        await createSalesOrder(form, outlets, profile);
      }
      setIsModalOpen(false);
      setEditingOrder(null);
      setForm({
        outletId: '',
        items: [{ productId: '', productName: '', quantity: 0, price: 0 }],
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error saving sales order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { productId: '', productName: '', quantity: 0, price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: keyof SalesOrderItem, value: any) => {
    const newItems = [...form.items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        productId: value,
        productName: product?.name || '',
        price: product?.price || 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setForm({ ...form, items: newItems });
  };

  const filteredOrders = orders.filter(order => 
    order.outletName.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#5A5A40]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[#5A5A40]">Sales Management</h2>
          <p className="text-black/40 mt-1">Manage customer orders and revenue</p>
        </div>
        <button 
          onClick={() => {
            setEditingOrder(null);
            setForm({
              outletId: '',
              items: [{ productId: '', productName: '', quantity: 0, price: 0 }],
              status: 'pending',
              createdAt: new Date().toISOString().split('T')[0]
            });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 bg-[#5A5A40] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[#4A4A34] transition-all"
        >
          <Plus size={20} />
          <span className="font-bold">New Sales Order</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Revenue"
          value={`$${totalSales.toLocaleString()}`}
          icon={CreditCard}
          color="emerald"
        />
        <StatsCard 
          title="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          color="indigo"
        />
        <StatsCard 
          title="Pending Orders"
          value={pendingOrders}
          icon={Store}
          color="amber"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-serif font-bold text-lg text-black">Sales Orders</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" size={18} />
            <input 
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F0]/50 text-[10px] font-bold text-black/40 uppercase tracking-widest">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Outlet</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-black/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-[#5A5A40]">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-bold text-black">{order.outletName}</td>
                  <td className="px-6 py-4 text-black/60">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-bold text-black">${order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      order.status === 'paid' ? 'success' : 
                      order.status === 'shipped' ? 'info' : 
                      order.status === 'cancelled' ? 'error' : 'warning'
                    }>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateSalesOrderStatus(order.id, 'paid')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Mark as Paid"
                          >
                            <CreditCard size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingOrder(order);
                              setForm({
                                outletId: order.outletId,
                                items: order.items,
                                status: order.status,
                                createdAt: new Date(order.createdAt).toISOString().split('T')[0]
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Order"
                          >
                            <FileText size={18} />
                          </button>
                        </>
                      )}
                      {order.status === 'paid' && (
                        <button 
                          onClick={() => updateSalesOrderStatus(order.id, 'ready_to_ship')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ready to Ship"
                        >
                          <Truck size={18} />
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'shipped' && (
                        <button 
                          onClick={() => updateSalesOrderStatus(order.id, 'cancelled')}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Cancel Order"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingOrder ? "Edit Sales Order" : "New Sales Order"}
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Customer Outlet</label>
              <select 
                required
                value={form.outletId}
                onChange={e => setForm({ ...form, outletId: e.target.value })}
                className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
              >
                <option value="">Select Outlet</option>
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Order Date</label>
              <input 
                type="date"
                required
                value={form.createdAt}
                onChange={e => setForm({ ...form, createdAt: e.target.value })}
                className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Order Items</label>
              <button 
                type="button"
                onClick={addItem}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center"
              >
                <Plus size={14} className="mr-1" /> Add Item
              </button>
            </div>
            {form.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end bg-black/[0.02] p-3 rounded-2xl border border-black/5">
                <div className="col-span-5 space-y-1">
                  <label className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Product</label>
                  <select 
                    required
                    value={item.productId}
                    onChange={e => updateItem(index, 'productId', e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-black/5 text-sm"
                  >
                    <option value="">Select Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Qty</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-full p-2 bg-white rounded-lg border border-black/5 text-sm"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Price</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={e => updateItem(index, 'price', parseFloat(e.target.value))}
                    className="w-full p-2 bg-white rounded-lg border border-black/5 text-sm"
                  />
                </div>
                <div className="col-span-1 pb-1">
                  <button 
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-black/5 flex justify-between items-center">
            <div className="text-right flex-1 pr-4">
              <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Total Amount</p>
              <p className="text-2xl font-serif font-bold text-black">
                ${form.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
              </p>
            </div>
            <button 
              disabled={submitting}
              type="submit"
              className="bg-[#5A5A40] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#4A4A34] disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving...' : editingOrder ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sales;
