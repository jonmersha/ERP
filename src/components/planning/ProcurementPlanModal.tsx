import React, { useState } from 'react';
import { RawMaterial, ProcurementPlan } from '../../types';
import { addProcurementPlan } from '../../services/planningService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  materials: RawMaterial[];
  onSuccess: () => void;
}

const ProcurementPlanModal: React.FC<Props> = ({ isOpen, onClose, materials, onSuccess }) => {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<Omit<ProcurementPlan, 'id'>>({
    materialId: '',
    quantity: 0,
    status: 'planned',
    year: new Date().getFullYear(),
    companyId: profile?.companyId || '',
  });

  const handleSubmit = async () => {
    if (!profile?.companyId) return;
    await addProcurementPlan({ ...plan, companyId: profile.companyId });
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Procurement Plan">
      <div className="space-y-4">
        <select
          className="w-full p-3 border rounded-xl"
          value={plan.materialId}
          onChange={e => setPlan(prev => ({ ...prev, materialId: e.target.value }))}
        >
          <option value="">Select Material</option>
          {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input
          type="number"
          placeholder="Quantity"
          className="w-full p-3 border rounded-xl"
          value={plan.quantity}
          onChange={e => setPlan(prev => ({ ...prev, quantity: Number(e.target.value) }))}
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

export default ProcurementPlanModal;
