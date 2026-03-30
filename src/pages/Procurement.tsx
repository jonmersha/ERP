import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProcurementData } from '../hooks/useProcurementData';
import { createPurchaseOrder, updatePurchaseOrder, createSupplier, updateOrderStatus } from '../services/procurementService';
import { PurchaseOrder, PurchaseOrderItem } from '../types';
import { Truck, Plus, Search, FileText, Loader2, Trash2, CheckCircle, Package, XCircle, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import StatsCard from '../components/common/StatsCard';
import Badge from '../components/common/Badge';

const Procurement: React.FC = () => {
  const { profile } = useAuth();
  const { suppliers, orders, materials, factories, warehouses, loading } = useProcurementData();
  
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);

  const [poForm, setPoForm] = useState<{
    supplierId: string;
    factoryId: string;
    warehouseId: string;
    status: PurchaseOrder['status'];
    items: PurchaseOrderItem[];
    createdAt: string;
  }>({
    supplierId: '',
    factoryId: '',
    warehouseId: '',
    status: 'pending',
    items: [{ itemId: '', quantity: 0, price: 0 }],
    createdAt: new Date().toISOString().split('T')[0]
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact: '',
    email: ''
  });

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOrder) {
        await updatePurchaseOrder(editingOrder.id, poForm, suppliers);
      } else {
        await createPurchaseOrder(poForm, suppliers, profile);
      }
      setIsPOModalOpen(false);
      setEditingOrder(null);
      setPoForm({
        supplierId: '',
        factoryId: '',
        warehouseId: '',
        status: 'pending',
        items: [{ itemId: '', quantity: 0, price: 0 }],
        createdAt: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error saving purchase order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSupplier(supplierForm, profile);
      setIsSupplierModalOpen(false);
      setSupplierForm({ name: '', contact: '', email: '' });
    } catch (error) {
      console.error("Error creating supplier:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const addPOItem = () => {
    setPoForm({
      ...poForm,
      items: [...poForm.items, { itemId: '', quantity: 0, price: 0 }]
    });
  };

  const removePOItem = (index: number) => {
    setPoForm({
      ...poForm,
      items: poForm.items.filter((_, i) => i !== index)
    });
  };

  const updatePOItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const newItems = [...poForm.items];
    if (field === 'itemId') {
      const material = materials.find(m => m.id === value);
      newItems[index] = {
        ...newItems[index],
        itemId: value,
        itemName: material?.name || '',
        price: material?.unitPrice || 0
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setPoForm({ ...poForm, items: newItems });
  };

  const totalProcurement = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingPOs = orders.filter(o => o.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[var(--color-main)]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[var(--color-main)]">Procurement</h2>
          <p className="text-[var(--color-text)]/40 mt-1">Manage suppliers and raw material acquisitions</p>
        </div>
        <div className="flex space-x-4">
          <Link 
            to="/planning"
            className="flex items-center space-x-2 bg-[var(--color-surface)] text-[var(--color-main)] px-6 py-3 rounded-2xl shadow-sm border border-[var(--color-text)]/5 hover:bg-[var(--color-bg)] transition-all"
          >
            <Calendar size={20} />
            <span className="font-bold">Planning</span>
          </Link>
          <button 
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex items-center space-x-2 bg-[var(--color-surface)] text-[var(--color-main)] px-6 py-3 rounded-2xl shadow-sm border border-[var(--color-text)]/5 hover:bg-[var(--color-bg)] transition-all"
          >
            <Plus size={20} />
            <span className="font-bold">Add Supplier</span>
          </button>
          <button 
            onClick={() => {
              setEditingOrder(null);
              setPoForm({
                supplierId: '',
                factoryId: '',
                warehouseId: '',
                status: 'pending',
                items: [{ itemId: '', quantity: 0, price: 0 }],
                createdAt: new Date().toISOString().split('T')[0]
              });
              setIsPOModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-[var(--color-main)] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[var(--color-main)]/90 transition-all"
          >
            <Plus size={20} />
            <span className="font-bold">New Purchase Order</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Spend"
          value={`$${totalProcurement.toLocaleString()}`}
          icon={FileText}
          color="emerald"
        />
        <StatsCard 
          title="Active Suppliers"
          value={suppliers.length}
          icon={Truck}
          color="indigo"
        />
        <StatsCard 
          title="Pending POs"
          value={pendingPOs}
          icon={Package}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 overflow-hidden">
            <div className="p-6 border-b border-[var(--color-text)]/5">
              <h3 className="font-serif font-bold text-lg text-[var(--color-text)]">Purchase Orders</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-bg)]/50 text-[10px] font-bold text-[var(--color-text)]/40 uppercase tracking-widest">
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-text)]/5 text-sm">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--color-text)]/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-mono font-bold text-[var(--color-main)]">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-bold text-[var(--color-text)]">{order.supplierName}</td>
                      <td className="px-6 py-4 font-bold text-[var(--color-text)]">${order.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          order.status === 'received' ? 'success' : 
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
                                onClick={() => updateOrderStatus(order.id, 'approved')}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Approve Order"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  setEditingOrder(order);
                                  setPoForm({
                                    supplierId: order.supplierId,
                                    factoryId: order.factoryId || '',
                                    warehouseId: order.warehouseId || '',
                                    status: order.status,
                                    items: order.items,
                                    createdAt: new Date(order.createdAt).toISOString().split('T')[0]
                                  });
                                  setIsPOModalOpen(true);
                                }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Order"
                              >
                                <FileText size={18} />
                              </button>
                            </>
                          )}
                          {order.status === 'approved' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark as Shipped"
                            >
                              <Truck size={18} />
                            </button>
                          )}
                          {order.status !== 'cancelled' && order.status !== 'received' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
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
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 overflow-hidden">
            <div className="p-6 border-b border-[var(--color-text)]/5 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-[var(--color-text)]">Suppliers</h3>
              <Truck size={20} className="text-[var(--color-text)]/20" />
            </div>
            <div className="divide-y divide-[var(--color-text)]/5 max-h-[500px] overflow-y-auto">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="p-4 hover:bg-[var(--color-text)]/[0.02] transition-colors">
                  <h4 className="font-bold text-[var(--color-text)]">{supplier.name}</h4>
                  <p className="text-xs text-[var(--color-text)]/40 mt-1">{supplier.contact}</p>
                  <p className="text-xs text-[var(--color-text)]/40">{supplier.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PO Modal */}
      <Modal 
        isOpen={isPOModalOpen} 
        onClose={() => setIsPOModalOpen(false)} 
        title={editingOrder ? "Edit Purchase Order" : "New Purchase Order"}
      >
        <form onSubmit={handleCreatePO} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Supplier</label>
              <select 
                required
                value={poForm.supplierId}
                onChange={e => setPoForm({ ...poForm, supplierId: e.target.value })}
                className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Order Date</label>
              <input 
                type="date"
                required
                value={poForm.createdAt}
                onChange={e => setPoForm({ ...poForm, createdAt: e.target.value })}
                className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Factory (Optional)</label>
              <select 
                value={poForm.factoryId}
                onChange={e => setPoForm({ ...poForm, factoryId: e.target.value })}
                className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
              >
                <option value="">Select Factory</option>
                {factories.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Warehouse (Optional)</label>
              <select 
                value={poForm.warehouseId}
                onChange={e => setPoForm({ ...poForm, warehouseId: e.target.value })}
                className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Order Items</label>
              <button 
                type="button"
                onClick={addPOItem}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center"
              >
                <Plus size={14} className="mr-1" /> Add Item
              </button>
            </div>
            {poForm.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end bg-black/[0.02] p-3 rounded-2xl border border-black/5">
                <div className="col-span-5 space-y-1">
                  <label className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Material</label>
                  <select 
                    required
                    value={item.itemId}
                    onChange={e => updatePOItem(index, 'itemId', e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-black/5 text-sm"
                  >
                    <option value="">Select Material</option>
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
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
                    onChange={e => updatePOItem(index, 'quantity', parseInt(e.target.value) || 0)}
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
                    onChange={e => updatePOItem(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white rounded-lg border border-black/5 text-sm"
                  />
                </div>
                <div className="col-span-1 pb-1">
                  <button 
                    type="button"
                    onClick={() => removePOItem(index)}
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
                ${poForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}
              </p>
            </div>
            <button 
              disabled={submitting}
              type="submit"
              className="bg-[var(--color-main)] text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-[var(--color-main)]/90 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving...' : editingOrder ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Modal */}
      <Modal 
        isOpen={isSupplierModalOpen} 
        onClose={() => setIsSupplierModalOpen(false)} 
        title="Add New Supplier"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Supplier Name</label>
            <input 
              type="text"
              required
              value={supplierForm.name}
              onChange={e => setSupplierForm({ ...supplierForm, name: e.target.value })}
              className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
              placeholder="e.g., Global Materials Inc."
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Contact Person</label>
            <input 
              type="text"
              required
              value={supplierForm.contact}
              onChange={e => setSupplierForm({ ...supplierForm, contact: e.target.value })}
              className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
              placeholder="e.g., John Doe"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Email Address</label>
            <input 
              type="email"
              required
              value={supplierForm.email}
              onChange={e => setSupplierForm({ ...supplierForm, email: e.target.value })}
              className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
              placeholder="e.g., john@globalmaterials.com"
            />
          </div>
          <button 
            disabled={submitting}
            type="submit"
            className="w-full bg-[var(--color-main)] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[var(--color-main)]/90 disabled:opacity-50 transition-all"
          >
            {submitting ? 'Creating...' : 'Create Supplier'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Procurement;
