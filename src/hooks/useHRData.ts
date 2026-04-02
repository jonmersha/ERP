import { useState, useEffect } from 'react';
import { Employee, Factory } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

export const useHRData = () => {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const fetchData = async () => {
      try {
        const [employeesData, factoriesData] = await Promise.all([
          apiFetch('/api/hr/employees?orderBy=name&orderDir=asc'),
          apiFetch('/api/core/factories')
        ]);

        if (Array.isArray(employeesData)) setEmployees(employeesData);
        if (Array.isArray(factoriesData)) setFactories(factoriesData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching HR data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [profile?.companyId]);

  return {
    employees,
    factories,
    loading
  };
};
