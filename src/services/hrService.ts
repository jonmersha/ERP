import { UserProfile } from '../types';

const API_BASE = '/api/hr';

export const createEmployee = async (form: any, profile: UserProfile | null) => {
  const response = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...form,
      salary: Number(form.salary),
      hireDate: new Date(form.hireDate).toISOString(),
      companyId: profile?.companyId || ''
    }),
  });
  if (!response.ok) throw new Error('Failed to create employee');
  return await response.json();
};
