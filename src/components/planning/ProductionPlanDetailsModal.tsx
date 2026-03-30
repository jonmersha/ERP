import React from 'react';
import { ProductionPlan, Product, Recipe, RawMaterial } from '../../types';
import Modal from '../Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: ProductionPlan;
  product: Product | undefined;
  recipe: Recipe | undefined;
  materials: RawMaterial[];
}

const ProductionPlanDetailsModal: React.FC<Props> = ({ isOpen, onClose, plan, product, recipe, materials }) => {
  if (!recipe) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Plan Details">
        <p className="text-red-500">No recipe found for this product.</p>
      </Modal>
    );
  }

  const requiredMaterials = recipe.bom.map(item => {
    const material = materials.find(m => m.id === item.materialId);
    return {
      name: material?.name || 'Unknown Material',
      quantity: item.quantity * plan.quantity,
      unit: item.unit
    };
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Details: ${product?.name || 'Product'}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="font-bold">Quantity:</span> {plan.quantity}</p>
          <p><span className="font-bold">Status:</span> <span className="capitalize">{plan.status}</span></p>
        </div>
        
        <h4 className="font-bold text-lg mt-4">Required Raw Materials</h4>
        <table className="w-full text-left">
          <thead>
            <tr className="text-black/40 text-sm border-b border-black/5">
              <th className="pb-2">Material</th>
              <th className="pb-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {requiredMaterials.map((item, index) => (
              <tr key={index} className="border-b border-black/5">
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.quantity} {item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default ProductionPlanDetailsModal;
