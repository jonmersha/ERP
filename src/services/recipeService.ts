import { Recipe } from '../types';

const API_BASE = '/api/production/recipes';

export const getRecipes = async (companyId: string): Promise<Recipe[]> => {
  const response = await fetch(`${API_BASE}?companyId=${companyId}`);
  if (!response.ok) throw new Error('Failed to fetch recipes');
  return await response.json();
};

export const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });
  return await response.json();
};

export const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });
  return await response.json();
};

export const deleteRecipe = async (id: string) => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return await response.json();
};
