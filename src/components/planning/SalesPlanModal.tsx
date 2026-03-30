import React, { useState } from 'react';
import { Product, SalesPlan } from '../../types';
import { addSalesPlan } from '../../services/planningService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSuccess: () => void;
}

const SalesPlanModal: React.FC<Props> = ({ isOpen, onClose, products, onSuccess }) => {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<Omit<SalesPlan, 'id'>>({
    productId: '',
    targetQuantity: 0,
    status: 'draft',
    year: new Date().getFullYear(),
    companyId: profile?.companyId || '',
  });

  const handleSubmit = async () => {
    if (!profile?.companyId) return;
    await addSalesPlan({ ...plan, companyId: profile.companyId });
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Sales Plan">
      <div className="space-y-4">
        <select
          className="w-full p-3 border rounded-xl"
          value={plan.productId}
          onChange={e => setPlan(prev => ({ ...prev, productId: e.target.value }))}
        >
          <option value="">Select Product</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input
          type="number"
          placeholder="Target Quantity"
          className="w-full p-3 border rounded-xl"
          value={plan.targetQuantity}
          onChange={e => setPlan(prev => ({ ...prev, targetQuantity: Number(e.target.value) }))}
        />
        <input
          type="number"
          placeholder="Year"
          className="w-full p-3 border rounded-xl"
          value={plan.year}
          onChange={e => setPlan(prev => ({ ...prev, year: Number(e.target.value) }))}
        />
        <button 
          onClick={handleSubmit}
          className="w-full bg-[#5A5A40] text-white p-3 rounded-xl"
        >
          Save Plan
        </button>
      </div>
    </Modal>
  );
};

export default SalesPlanModal;
