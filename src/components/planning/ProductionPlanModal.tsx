import React, { useState } from 'react';
import { Factory, Product } from '../../types';
import { addProductionPlan } from '../../services/planningService';
import { useAuth } from '../../context/AuthContext';
import { X, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  factories: Factory[];
  products: Product[];
  onSuccess: () => void;
}

const ProductionPlanModal: React.FC<Props> = ({ isOpen, onClose, factories, products, onSuccess }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    factoryId: '',
    productId: '',
    productType: '',
    year: new Date().getFullYear(),
    quarter: '' as 'Q1' | 'Q2' | 'Q3' | 'Q4' | '',
    month: '' as number | '',
    quantity: 0
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.companyId) return;
    setLoading(true);
    try {
      await addProductionPlan({
        ...form,
        quarter: form.quarter || undefined,
        month: form.month || undefined,
        status: 'planned',
        companyId: profile.companyId
      } as any);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error adding plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-3xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">New Production Plan</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select className="w-full p-3 rounded-xl border" onChange={e => setForm({...form, factoryId: e.target.value})} required>
            <option value="">Select Factory</option>
            {factories.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select className="w-full p-3 rounded-xl border" onChange={e => setForm({...form, productId: e.target.value})} required>
            <option value="">Select Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input type="text" placeholder="Product Type" className="w-full p-3 rounded-xl border" onChange={e => setForm({...form, productType: e.target.value})} required />
          <input type="number" placeholder="Year" className="w-full p-3 rounded-xl border" value={form.year} onChange={e => setForm({...form, year: e.target.value === '' ? 0 : parseInt(e.target.value)})} required />
          <select className="w-full p-3 rounded-xl border" onChange={e => setForm({...form, quarter: e.target.value as any})}>
            <option value="">Select Quarter (Optional)</option>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <select className="w-full p-3 rounded-xl border" onChange={e => setForm({...form, month: e.target.value ? parseInt(e.target.value) : ''})}>
            <option value="">Select Month (Optional)</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="number" placeholder="Quantity" className="w-full p-3 rounded-xl border" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value === '' ? 0 : parseInt(e.target.value)})} required />
          <button type="submit" className="w-full bg-[#5A5A40] text-white p-3 rounded-xl font-bold" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Create Plan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductionPlanModal;
