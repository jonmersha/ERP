import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Employee, Factory } from '../types';

export const useHRData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubEmployees = onSnapshot(query(collection(db, 'employees'), orderBy('name', 'asc')), (snap) => {
      setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    });
    const unsubFactories = onSnapshot(collection(db, 'factories'), (snap) => {
      setFactories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Factory)));
      setLoading(false);
    });

    return () => {
      unsubEmployees();
      unsubFactories();
    };
  }, []);

  return {
    employees,
    factories,
    loading
  };
};
