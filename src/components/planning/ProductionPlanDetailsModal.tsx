import React from 'react';
import { ProductionPlan, Product, Recipe, RawMaterial } from '../../types';
import Modal from '../Modal';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: ProductionPlan;
  product: Product | undefined;
  recipe: Recipe | undefined;
  materials: RawMaterial[];
  onSuccess: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductionPlanDetailsModal: React.FC<Props> = ({ isOpen, onClose, plan, product, recipe, materials, onSuccess, onEdit, onDelete }) => {
  const requiredMaterials = recipe?.bom.map(item => {
    const material = materials.find(m => m.id === item.materialId);
    return {
      name: material?.name || 'Unknown Material',
      quantity: item.quantity * plan.totalQuantity,
      unit: item.unit
    };
  }) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Details: ${product?.name || 'Product'}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="font-bold">{t('Total Quantity:')}</span> {(plan.totalQuantity || 0).toLocaleString()}</p>
          <p><span className="font-bold">{t('Status:')}</span> <span className="capitalize">{plan.status}</span></p>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <h4 className="font-bold text-lg">{t('Hierarchical Plan')}</h4>
        </div>
        {(plan.quarterlyPlans || []).map(q => (
          <div key={q.quarter} className="border-b border-black/5 pb-2">
            <p className="font-bold">{q.quarter}: {(q.quantity || 0).toLocaleString()} {t('units')}</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(q.monthlyPlans || []).map(m => (
                <p key={m.month}>{t('Month')} {m.month}: {(m.quantity || 0).toLocaleString()} {t('units')}</p>
              ))}
            </div>
          </div>
        ))}

        <h4 className="font-bold text-lg mt-4">{t('Required Raw Materials')}</h4>
        {!recipe ? (
          <p className="text-red-500 text-sm">{t('No recipe found for this product. Raw material requirements cannot be calculated.')}</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-black/40 text-sm border-b border-black/5">
                <th className="pb-2">{t('Material')}</th>
                <th className="pb-2">{t('Quantity')}</th>
              </tr>
            </thead>
            <tbody>
              {requiredMaterials.map((item, index) => (
                <tr key={index} className="border-b border-black/5">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">{(item.quantity || 0).toLocaleString()} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div className="flex justify-end space-x-3 mt-8 border-t border-black/5 pt-4">
          <button 
            onClick={() => { onEdit(); }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[var(--color-main)] text-white hover:bg-[var(--color-main)]/90"
          >
            <Edit size={16} />
            <span>{t('Edit Plan')}</span>
          </button>
          {plan.status !== 'approved' && (
            <button 
              onClick={() => { onClose(); onDelete(); }}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
            >
              <Trash2 size={16} />
              <span>{t('Delete Plan')}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductionPlanDetailsModal;
