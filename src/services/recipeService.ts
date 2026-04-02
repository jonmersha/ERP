import { Recipe } from '../types';
import { apiFetch } from '../utils/api';

const API_BASE = '/api/production/recipes';

export const getRecipes = async (): Promise<Recipe[]> => {
  return await apiFetch(`${API_BASE}`);
};

export const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
  return await apiFetch(API_BASE, {
    method: 'POST',
    body: JSON.stringify(recipe),
  });
};

export const updateRecipe = async (id: string, recipe: Partial<Recipe>) => {
  return await apiFetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(recipe),
  });
};

export const deleteRecipe = async (id: string) => {
  return await apiFetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
};
