import React, { useState, useEffect } from 'react';
import { SalesPlan, Product } from '../../types';
import { getSalesPlans } from '../../services/planningService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Plus } from 'lucide-react';
import SalesPlanModal from './SalesPlanModal';

interface Props {
  products: Product[];
}

const SalesPlanList: React.FC<Props> = ({ products }) => {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<SalesPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (profile?.companyId) {
      getSalesPlans(profile.companyId).then(setPlans).finally(() => setLoading(false));
    }
  }, [profile]);

  const totalQuantity = plans.reduce((sum, plan) => sum + plan.targetQuantity, 0);

  if (loading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-6 text-[var(--color-text)]">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Sales Plans</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[var(--color-main)] text-white px-4 py-2 rounded-xl"
        >
          <Plus size={16} />
          <span>New Plan</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-text)]/10">
              <th className="p-4 font-bold">Product</th>
              <th className="p-4 font-bold">Target Quantity</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold">Period</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan.id} className="border-b border-[var(--color-text)]/5 hover:bg-[var(--color-text)]/[0.02]">
                <td className="p-4">{products.find(p => p.id === plan.productId)?.name || 'Unknown Product'}</td>
                <td className="p-4">{plan.targetQuantity}</td>
                <td className="p-4 capitalize">{plan.status}</td>
                <td className="p-4">{plan.year} {plan.quarter || ''} {plan.month || ''}</td>
              </tr>
            ))}
            <tr className="font-bold bg-[var(--color-text)]/5">
              <td className="p-4">Total</td>
              <td className="p-4">{totalQuantity}</td>
              <td className="p-4"></td>
              <td className="p-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <SalesPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        products={products}
        onSuccess={() => {
          if (profile?.companyId) getSalesPlans(profile.companyId).then(setPlans);
        }}
      />
    </div>
  );
};

export default SalesPlanList;
