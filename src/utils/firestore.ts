import { apiService, FetchOptions } from '../services/apiService';

export const fetchCollection = async (
  collectionName: string, 
  companyId: string, 
  options?: FetchOptions
) => {
  return apiService.fetchCollection(collectionName, companyId, options);
};
