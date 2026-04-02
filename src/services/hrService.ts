import { UserProfile } from '../types';
import { apiFetch } from '../utils/api';

const API_BASE = '/api/hr';

export const createEmployee = async (form: any, profile: UserProfile | null) => {
  return await apiFetch(`${API_BASE}/employees`, {
    method: 'POST',
    body: JSON.stringify({
      ...form,
      salary: Number(form.salary),
      hireDate: new Date(form.hireDate).toISOString(),
      companyId: profile?.companyId || ''
    }),
  });
};
