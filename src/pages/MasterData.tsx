import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Factory, Warehouse, Product, RawMaterial, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { motion } from 'motion/react';
import { 
  Database, 
  Factory as FactoryIcon, 
  Warehouse as WarehouseIcon, 
  Package, 
  Tag, 
  Plus, 
  Trash2, 
  Loader2,
  ShieldAlert,
  Edit2
} from 'lucide-react';
import Modal from '../components/Modal';

const MasterData: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  
  // Data States
  const [factories, setFactories] = useState<Factory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState<'factories' | 'warehouses' | 'products' | 'raw' | 'categories'>('factories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form States
  const [factoryForm, setFactoryForm] = useState({ name: '', location: '' });
  const [warehouseForm, setWarehouseForm] = useState({ name: '', location: '', factoryId: '' });
  const [productForm, setProductForm] = useState({ name: '', category: '', packageSize: '', unit: '', price: 0 });
  const [rawForm, setRawForm] = useState({ name: '', unit: 'kg' as RawMaterial['unit'] });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!profile?.companyId) return;

    const companyFilter = where('companyId', '==', profile.companyId);

    const unsubFactories = onSnapshot(query(collection(db, 'factories'), companyFilter), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'factories'));

    const unsubWarehouses = onSnapshot(query(collection(db, 'warehouses'), companyFilter), (snap) => {
      setWarehouses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warehouse)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'warehouses'));

    const unsubProducts = onSnapshot(query(collection(db, 'products'), companyFilter), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    const unsubRaw = onSnapshot(query(collection(db, 'rawMaterials'), companyFilter), (snap) => {
      setRawMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RawMaterial)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'rawMaterials'));

    const unsubCats = onSnapshot(query(collection(db, 'categories'), companyFilter), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'categories'));

    return () => {
      unsubFactories();
      unsubWarehouses();
      unsubProducts();
      unsubRaw();
      unsubCats();
    };
  }, [profile?.companyId]);

  const canManage = isAdmin || profile?.role === 'admin' || profile?.role === 'factory_manager';

  const handleEdit = (item: any) => {
    setEditingItem(item);
    switch (activeTab) {
      case 'factories': setFactoryForm({ name: item.name, location: item.location }); break;
      case 'warehouses': setWarehouseForm({ name: item.name, location: item.location, factoryId: item.factoryId }); break;
      case 'products': setProductForm({ name: item.name, category: item.category, packageSize: item.packageSize, unit: item.unit, price: item.price }); break;
      case 'raw': setRawForm({ name: item.name, unit: item.unit }); break;
      case 'categories': setCategoryForm({ name: item.name, description: item.description }); break;
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !profile?.companyId) return;
    setSubmitting(true);

    let colName = '';
    let formData: any = {};

    try {
      switch (activeTab) {
        case 'factories': colName = 'factories'; formData = factoryForm; break;
        case 'warehouses': colName = 'warehouses'; formData = warehouseForm; break;
        case 'products': colName = 'products'; formData = { ...productForm, price: Number(productForm.price) }; break;
        case 'raw': colName = 'rawMaterials'; formData = rawForm; break;
        case 'categories': colName = 'categories'; formData = categoryForm; break;
      }

      if (editingItem) {
        await updateDoc(doc(db, colName, editingItem.id), formData);
      } else {
        await addDoc(collection(db, colName), { ...formData, companyId: profile.companyId });
      }
      
      setIsModalOpen(false);
      setEditingItem(null);
      // Reset forms
      setFactoryForm({ name: '', location: '' });
      setWarehouseForm({ name: '', location: '', factoryId: '' });
      setProductForm({ name: '', category: '', packageSize: '', unit: '', price: 0 });
      setRawForm({ name: '', unit: 'kg' });
      setCategoryForm({ name: '', description: '' });
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, colName);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, collectionName: string) => {
    if (!canManage) return;
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, collectionName, id));
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  if (!canManage) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <ShieldAlert size={64} className="text-rose-500" />
        <h2 className="text-2xl font-serif font-bold text-[var(--color-text)]">Access Restricted</h2>
        <p className="text-[var(--color-text)]/40">Only administrators and managers can access structural data management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[var(--color-main)]">Master Data</h2>
          <p className="text-[var(--color-text)]/40 mt-1">Manage structural entities and product definitions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[var(--color-main)] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[var(--color-main)]/90 transition-all"
        >
          <Plus size={20} />
          <span className="font-bold">Add {activeTab.slice(0, -1)}</span>
        </button>
      </header>

      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'factories', label: 'Factories', icon: FactoryIcon },
          { id: 'warehouses', label: 'Warehouses', icon: WarehouseIcon },
          { id: 'products', label: 'Products', icon: Package },
          { id: 'raw', label: 'Raw Materials', icon: Database },
          { id: 'categories', label: 'Categories', icon: Tag },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-[var(--color-main)] text-white shadow-md' : 'bg-[var(--color-surface)] text-[var(--color-text)]/40 border border-[var(--color-text)]/5 hover:bg-[var(--color-text)]/[0.05]'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-bg)]/50 text-xs uppercase tracking-widest text-[var(--color-text)]/40 font-bold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-text)]/5">
              {activeTab === 'factories' && factories.map(f => (
                <tr key={f.id} className="hover:bg-[var(--color-text)]/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-[var(--color-text)]">{f.name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]/60">{f.location}</td>
                  <td className="px-6 py-4 text-right flex justify-end space-x-2">
                    <button onClick={() => handleEdit(f)} className="p-2 text-[var(--color-main)] hover:bg-[var(--color-main)]/10 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(f.id, 'factories')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'warehouses' && warehouses.map(w => (
                <tr key={w.id} className="hover:bg-[var(--color-text)]/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-[var(--color-text)]">{w.name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]/60">
                    {w.location} • {factories.find(f => f.id === w.factoryId)?.name || 'No Factory'}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end space-x-2">
                    <button onClick={() => handleEdit(w)} className="p-2 text-[var(--color-main)] hover:bg-[var(--color-main)]/10 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(w.id, 'warehouses')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'products' && products.map(p => (
                <tr key={p.id} className="hover:bg-[var(--color-text)]/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-[var(--color-text)]">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]/60">
                    {p.category} • {p.packageSize} • ${p.price}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end space-x-2">
                    <button onClick={() => handleEdit(p)} className="p-2 text-[var(--color-main)] hover:bg-[var(--color-main)]/10 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(p.id, 'products')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'raw' && rawMaterials.map(r => (
                <tr key={r.id} className="hover:bg-[var(--color-text)]/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-[var(--color-text)]">{r.name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]/60">Unit: {r.unit}</td>
                  <td className="px-6 py-4 text-right flex justify-end space-x-2">
                    <button onClick={() => handleEdit(r)} className="p-2 text-[var(--color-main)] hover:bg-[var(--color-main)]/10 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(r.id, 'rawMaterials')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
              {activeTab === 'categories' && categories.map(c => (
                <tr key={c.id} className="hover:bg-[var(--color-text)]/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-[var(--color-text)]">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text)]/60">{c.description}</td>
                  <td className="px-6 py-4 text-right flex justify-end space-x-2">
                    <button onClick={() => handleEdit(c)} className="p-2 text-[var(--color-main)] hover:bg-[var(--color-main)]/10 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(c.id, 'categories')} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} title={`${editingItem ? 'Edit' : 'Add New'} ${activeTab.slice(0, -1)}`}>
        <form onSubmit={handleSave} className="space-y-4">
          {activeTab === 'factories' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Factory Name</label>
                <input required value={factoryForm.name} onChange={e => setFactoryForm({...factoryForm, name: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Location</label>
                <input required value={factoryForm.location} onChange={e => setFactoryForm({...factoryForm, location: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" />
              </div>
            </>
          )}
          {activeTab === 'warehouses' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Warehouse Name</label>
                <input required value={warehouseForm.name} onChange={e => setWarehouseForm({...warehouseForm, name: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Location</label>
                <input required value={warehouseForm.location} onChange={e => setWarehouseForm({...warehouseForm, location: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Associated Factory</label>
                <select required value={warehouseForm.factoryId} onChange={e => setWarehouseForm({...warehouseForm, factoryId: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]">
                  <option value="">Select Factory</option>
                  {factories.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </>
          )}
          {activeTab === 'products' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Product Name</label>
                <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Category</label>
                  <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Price ($)</label>
                  <input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value === '' ? 0 : Number(e.target.value)})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Package Size</label>
                  <input required value={productForm.packageSize} onChange={e => setProductForm({...productForm, packageSize: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" placeholder="e.g. 500ml, 1kg" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Base Unit</label>
                  <input required value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" placeholder="e.g. Bottle, Box" />
                </div>
              </div>
            </>
          )}
          {activeTab === 'raw' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Material Name</label>
                <input required value={rawForm.name} onChange={e => setRawForm({...rawForm, name: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Unit</label>
                <select required value={rawForm.unit} onChange={e => setRawForm({...rawForm, unit: e.target.value as any})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]">
                  <option value="kg">Kilogram (kg)</option>
                  <option value="liter">Liter (l)</option>
                  <option value="unit">Unit (pcs)</option>
                  <option value="bag">Bag</option>
                </select>
              </div>
            </>
          )}
          {activeTab === 'categories' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Category Name</label>
                <input required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 text-[var(--color-text)]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Description</label>
                <textarea value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} className="w-full p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 h-24 text-[var(--color-text)]" />
              </div>
            </>
          )}
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[var(--color-main)] text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-[var(--color-main)]/90 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <span>{editingItem ? 'Update' : 'Create'} {activeTab.slice(0, -1)}</span>}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MasterData;
