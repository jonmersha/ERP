import { collection, addDoc, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types';

const COLLECTION = 'recipes';

export const getRecipes = async (companyId: string): Promise<Recipe[]> => {
  const q = query(collection(db, COLLECTION), where('companyId', '==', companyId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
};

export const addRecipe = (recipe: Omit<Recipe, 'id'>) => addDoc(collection(db, COLLECTION), recipe);
export const updateRecipe = (id: string, recipe: Partial<Recipe>) => updateDoc(doc(db, COLLECTION, id), recipe);
export const deleteRecipe = (id: string) => deleteDoc(doc(db, COLLECTION, id));
