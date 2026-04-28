import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Employee, Factory } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export const useHRData = () => {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.companyId) return;

    const fetchData = async () => {
      try {
        const companyId = profile.companyId;
        const [employeesRes, factoriesRes] = await Promise.all([
          fetch(`/api/hr/employees?companyId=${companyId}&orderBy=name&orderDir=asc`),
          fetch(`/api/core/factories?companyId=${companyId}`)
        ]);

        const [employeesData, factoriesData] = await Promise.all([
          employeesRes.json(),
          factoriesRes.json()
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
