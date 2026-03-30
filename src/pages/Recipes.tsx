import React, { useState, useEffect } from 'react';
import { Recipe, Product } from '../types';
import { getRecipes, addRecipe } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';
import { useInventoryData } from '../hooks/useInventoryData';
import { Loader2, Plus, BookOpen } from 'lucide-react';
import Modal from '../components/Modal';

const Recipes: React.FC = () => {
  const { profile } = useAuth();
  const { products, loading: inventoryLoading } = useInventoryData();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, 'id'>>({
    productId: '',
    name: '',
    bom: [],
    processingSteps: [],
    yieldPercentage: 100,
    companyId: '',
  });
  const [newIngredient, setNewIngredient] = useState({ materialId: '', quantity: 0 });
  const [newStep, setNewStep] = useState('');

  useEffect(() => {
    if (profile?.companyId) {
      getRecipes(profile.companyId).then(setRecipes).finally(() => setLoading(false));
      setNewRecipe(prev => ({ ...prev, companyId: profile.companyId }));
    }
  }, [profile]);

  const handleAddRecipe = async () => {
    if (!profile?.companyId) return;
    try {
      await addRecipe(newRecipe);
      setIsModalOpen(false);
      setNewRecipe({
        productId: '',
        name: '',
        bom: [],
        processingSteps: [],
        yieldPercentage: 100,
        companyId: profile.companyId,
      });
      // Refresh
      const updatedRecipes = await getRecipes(profile.companyId);
      setRecipes(updatedRecipes);
    } catch (error) {
      console.error("Error adding recipe:", error);
    }
  };

  if (loading || inventoryLoading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif font-bold text-[var(--color-main)]">Recipe & BOM Management</h2>
        <p className="text-[var(--color-text)]/40 mt-1">Define product recipes and ingredient requirements.</p>
      </header>

      <div className="bg-[var(--color-surface)] p-8 rounded-3xl border border-[var(--color-text)]/5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--color-text)]">Recipes</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-[var(--color-main)] text-white px-4 py-2 rounded-xl"
          >
            <Plus size={16} />
            <span>New Recipe</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="border border-[var(--color-text)]/5 p-6 rounded-2xl space-y-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="text-[var(--color-main)]" />
                <h4 className="font-bold text-lg text-[var(--color-text)]">{recipe.name}</h4>
              </div>
              <p className="text-sm text-[var(--color-text)]/60">Product: {products.find(p => p.id === recipe.productId)?.name}</p>
              <div className="text-sm text-[var(--color-text)]/40">
                <p>Ingredients: {recipe.bom.length}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Recipe">
        <div className="space-y-4 text-[var(--color-text)]">
          <input
            type="text"
            placeholder="Recipe Name"
            className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-text)]/5 rounded-xl"
            value={newRecipe.name}
            onChange={e => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
          />
          <select
            className="w-full p-3 bg-[var(--color-bg)] border border-[var(--color-text)]/5 rounded-xl"
            value={newRecipe.productId}
            onChange={e => setNewRecipe(prev => ({ ...prev, productId: e.target.value }))}
          >
            <option value="">Select Product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          
          <div className="space-y-2">
            <h4 className="font-bold">BOM Ingredients</h4>
            {newRecipe.bom.map((ing, i) => <div key={i} className="text-sm">{ing.materialId}: {ing.quantity}</div>)}
            <div className="flex space-x-2">
              <input type="text" placeholder="Material ID" className="flex-1 p-2 bg-[var(--color-bg)] border border-[var(--color-text)]/5 rounded" value={newIngredient.materialId} onChange={e => setNewIngredient(prev => ({...prev, materialId: e.target.value}))} />
              <input type="number" placeholder="Qty" className="w-20 p-2 bg-[var(--color-bg)] border border-[var(--color-text)]/5 rounded" value={newIngredient.quantity} onChange={e => setNewIngredient(prev => ({...prev, quantity: parseInt(e.target.value)}))} />
              <button onClick={() => {
                setNewRecipe(prev => ({...prev, bom: [...prev.bom, newIngredient]}));
                setNewIngredient({materialId: '', quantity: 0});
              }} className="bg-[var(--color-main)] text-white p-2 rounded">+</button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold">Processing Steps</h4>
            {newRecipe.processingSteps.map((step, i) => <div key={i} className="text-sm">{i+1}. {step}</div>)}
            <div className="flex space-x-2">
              <input type="text" placeholder="Step description" className="flex-1 p-2 bg-[var(--color-bg)] border border-[var(--color-text)]/5 rounded" value={newStep} onChange={e => setNewStep(e.target.value)} />
              <button onClick={() => {
                setNewRecipe(prev => ({...prev, processingSteps: [...prev.processingSteps, newStep]}));
                setNewStep('');
              }} className="bg-[var(--color-main)] text-white p-2 rounded">+</button>
            </div>
          </div>

          <button 
            onClick={handleAddRecipe}
            className="w-full bg-[var(--color-main)] text-white p-3 rounded-xl"
          >
            Save Recipe
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Recipes;
