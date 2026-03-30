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

    const companyFilter = where('companyId', '==', profile.companyId);

    const unsubEmployees = onSnapshot(query(collection(db, 'employees'), companyFilter, orderBy('name', 'asc')), (snap) => {
      setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'employees'));

    const unsubFactories = onSnapshot(query(collection(db, 'factories'), companyFilter), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'factories'));

    return () => {
      unsubEmployees();
      unsubFactories();
    };
  }, [profile?.companyId]);

  return {
    employees,
    factories,
    loading
  };
};
