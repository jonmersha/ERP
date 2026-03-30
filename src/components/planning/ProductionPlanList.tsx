import React, { useState, useEffect } from 'react';
import { ProductionPlan, Factory, Product, Recipe, RawMaterial } from '../../types';
import { getProductionPlans } from '../../services/planningService';
import { getRecipes } from '../../services/recipeService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Plus, Info } from 'lucide-react';
import ProductionPlanModal from './ProductionPlanModal';
import ProductionPlanDetailsModal from './ProductionPlanDetailsModal';

interface Props {
  factories: Factory[];
  products: Product[];
  materials: RawMaterial[];
}

const ProductionPlanList: React.FC<Props> = ({ factories, products, materials }) => {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<ProductionPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);

  const fetchPlans = () => {
    if (profile?.companyId) {
      setLoading(true);
      Promise.all([
        getProductionPlans(profile.companyId),
        getRecipes(profile.companyId)
      ]).then(([plans, recipes]) => {
        setPlans(plans);
        setRecipes(recipes);
      }).finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [profile]);

  if (loading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-4 text-[var(--color-text)]">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Production Plans</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[var(--color-main)] text-white px-4 py-2 rounded-xl"
        >
          <Plus size={16} />
          <span>New Plan</span>
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[var(--color-text)]/40 text-sm">
            <th className="pb-2">Product</th>
            <th className="pb-2">Type</th>
            <th className="pb-2">Year</th>
            <th className="pb-2">Quantity</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map(plan => (
            <tr key={plan.id} className="border-t border-[var(--color-text)]/5">
              <td className="py-3">{products.find(p => p.id === plan.productId)?.name || plan.productId}</td>
              <td className="py-3">{plan.productType}</td>
              <td className="py-3">{plan.year}</td>
              <td className="py-3">{plan.quantity}</td>
              <td className="py-3 capitalize">{plan.status}</td>
              <td className="py-3">
                <button 
                  onClick={() => setSelectedPlan(plan)}
                  className="text-[var(--color-main)] hover:text-[var(--color-main)]/80"
                >
                  <Info size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ProductionPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        factories={factories}
        products={products}
        onSuccess={fetchPlans}
      />
      {selectedPlan && (
        <ProductionPlanDetailsModal
          isOpen={!!selectedPlan}
          onClose={() => setSelectedPlan(null)}
          plan={selectedPlan}
          product={products.find(p => p.id === selectedPlan.productId)}
          recipe={recipes.find(r => r.productId === selectedPlan.productId)}
          materials={materials}
        />
      )}
    </div>
  );
};

export default ProductionPlanList;
