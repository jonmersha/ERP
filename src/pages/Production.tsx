import React, { useState } from 'react';
import { useProductionData } from '../hooks/useProductionData';
import { createProductionPlan, updateProductionProgress } from '../services/productionService';
import { transferProductionToWarehouse } from '../services/inventoryService';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Factory as FactoryIcon, Play, CheckCircle, Clock, Plus, Settings, Loader2, ArrowRight } from 'lucide-react';
import Modal from '../components/Modal';
import Badge from '../components/common/Badge';

const Production: React.FC = () => {
  const { profile } = useAuth();
  const { factories, plans, products, loading } = useProductionData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressModal, setProgressModal] = useState<{isOpen: boolean, planId: string, quantity: number} | null>(null);
  const [transferModal, setTransferModal] = useState<{isOpen: boolean, planId: string, productId: string, quantity: number} | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    factoryId: '',
    productId: '',
    quantity: 0,
    status: 'planned' as 'planned' | 'in_progress' | 'completed',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProductionPlan(form, profile);
      setIsModalOpen(false);
      setForm({
        factoryId: '',
        productId: '',
        quantity: 0,
        status: 'planned',
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error creating production plan:", error);
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2 className="text-4xl font-serif font-bold text-[var(--color-main)]">Production</h2>
          <p className="text-[var(--color-text)]/40 mt-1">Manufacturing schedules and factory output</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[var(--color-main)] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[var(--color-main)]/90 transition-all"
        >
          <Plus size={20} />
          <span className="font-bold">New Production Plan</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {factories.map(factory => (
          <motion.div 
            key={factory.id}
            whileHover={{ y: -5 }}
            className="bg-[var(--color-surface)] p-6 rounded-3xl shadow-sm border border-[var(--color-text)]/5"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-[var(--color-main)]/10 rounded-2xl text-[var(--color-main)]">
                <FactoryIcon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--color-text)]">{factory.name}</h3>
                <p className="text-xs text-[var(--color-text)]/40">{factory.location}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-[var(--color-text)]/5 flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text)]/40">Active Plans</span>
              <span className="font-bold text-[var(--color-main)]">{plans.filter(p => p.factoryId === factory.id && p.status !== 'completed').length}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 overflow-hidden">
        <div className="p-6 border-b border-[var(--color-text)]/5">
          <h3 className="font-serif font-bold text-lg text-[var(--color-text)]">Manufacturing Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg)]/50 text-[10px] font-bold text-[var(--color-text)]/40 uppercase tracking-widest">
                <th className="px-6 py-4">Plan ID</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Factory</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-text)]/5 text-sm">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-[var(--color-text)]/[0.02] transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[var(--color-main)]">#{plan.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 font-bold text-[var(--color-text)]">
                    {products.find(p => p.id === plan.productId)?.name || 'Unknown Product'}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text)]/60">
                    {factories.find(f => f.id === plan.factoryId)?.name || 'Unknown Factory'}
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--color-text)]">{plan.quantity}</td>
                  <td className="px-6 py-4 text-[var(--color-text)]/60">{new Date(plan.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      plan.status === 'completed' ? 'success' : 
                      plan.status === 'in_progress' ? 'info' : 'warning'
                    }>
                      {plan.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      {plan.status === 'planned' && (
                        <button 
                          onClick={() => updateProductionProgress(plan.id, plan.quantityProduced, 'in_progress')}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Start Production"
                        >
                          <Play size={18} />
                        </button>
                      )}
                      {plan.status === 'in_progress' && (
                        <>
                          <button 
                            onClick={() => setProgressModal({isOpen: true, planId: plan.id, quantity: plan.quantityProduced})}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Update Progress"
                          >
                            <Clock size={18} />
                          </button>
                          <button 
                            onClick={() => updateProductionProgress(plan.id, plan.quantity, 'completed')}
                            className="p-2 text-[var(--color-main)] hover:bg-[var(--color-main)]/10 rounded-lg transition-colors"
                            title="Complete Production"
                          >
                            <CheckCircle size={18} />
                          </button>
                        </>
                      )}
                      {plan.status === 'completed' && (
                        <button 
                          onClick={() => setTransferModal({isOpen: true, planId: plan.id, productId: plan.productId, quantity: plan.quantityProduced})}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Transfer to Warehouse"
                        >
                          <ArrowRight size={18} />
                        </button>
                      )}
                      <button className="p-2 text-[var(--color-text)]/20 hover:text-[var(--color-text)]/40 rounded-lg transition-colors">
                        <Settings size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Production Plan">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Target Factory</label>
            <select 
              required
              value={form.factoryId}
              onChange={e => setForm({ ...form, factoryId: e.target.value })}
              className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
            >
              <option value="">Select Factory</option>
              {factories.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Product to Manufacture</label>
            <select 
              required
              value={form.productId}
              onChange={e => setForm({ ...form, productId: e.target.value })}
              className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Quantity</label>
              <input 
                type="number"
                required
                min="1"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })}
                className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Start Date</label>
              <input 
                type="date"
                required
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
              />
            </div>
          </div>
          <button 
            disabled={submitting}
            type="submit"
            className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#4A4A30] disabled:opacity-50 transition-all"
          >
            {submitting ? 'Creating...' : 'Schedule Production'}
          </button>
        </form>
      </Modal>
      <Modal isOpen={!!progressModal?.isOpen} onClose={() => setProgressModal(null)} title="Update Progress">
        <div className="space-y-4">
          <input 
            type="number"
            value={progressModal?.quantity || 0}
            onChange={e => setProgressModal(prev => prev ? {...prev, quantity: parseInt(e.target.value)} : null)}
            className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5"
          />
          <button 
            onClick={async () => {
              if(progressModal) {
                await updateProductionProgress(progressModal.planId, progressModal.quantity, 'in_progress');
                setProgressModal(null);
              }
            }}
            className="w-full bg-[#5A5A40] text-white p-3 rounded-xl"
          >
            Update
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!transferModal?.isOpen} onClose={() => setTransferModal(null)} title="Transfer to Warehouse">
        <div className="space-y-4">
          <select 
            id="warehouse-select"
            className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5"
          >
            <option value="">Select Warehouse</option>
            {factories.map(f => (
              <option key={f.id} value={f.id}>{f.name} Warehouse</option>
            ))}
          </select>
          <button 
            onClick={async () => {
              const warehouseId = (document.getElementById('warehouse-select') as HTMLSelectElement).value;
              if(transferModal && warehouseId) {
                await transferProductionToWarehouse(transferModal.productId, transferModal.quantity, warehouseId, profile);
                setTransferModal(null);
              }
            }}
            className="w-full bg-[#5A5A40] text-white p-3 rounded-xl"
          >
            Transfer
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default Production;
