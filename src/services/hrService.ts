import { UserProfile } from '../types';
import { apiService } from './apiService';

export const createEmployee = async (form: any, profile: UserProfile | null) => {
  return await apiService.post('hr/employees', {
    ...form,
    salary: Number(form.salary),
    hireDate: new Date(form.hireDate).toISOString(),
    companyId: profile?.companyId || ''
  });
};
