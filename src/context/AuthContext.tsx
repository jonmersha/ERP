"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, Company } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  company: Company | null;
  loading: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  company: null,
  loading: true,
  isAdmin: false,
  hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubCompany: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Cleanup previous listeners
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }
      if (unsubCompany) {
        unsubCompany();
        unsubCompany = null;
      }

      if (user) {
        const profileRef = doc(db, 'users', user.uid);
        unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            const profileData = docSnap.data() as UserProfile;
            setProfile({ ...profileData, id: docSnap.id, uid: docSnap.id });

            // Fetch company data
            if (profileData.companyId) {
              const companyRef = doc(db, 'companies', profileData.companyId);
              unsubCompany = onSnapshot(companyRef, (companySnap) => {
                if (companySnap.exists()) {
                  setCompany(companySnap.data() as Company);
                } else {
                  setCompany(null);
                }
                setLoading(false);
              }, (error) => {
                setLoading(false);
                handleFirestoreError(error, OperationType.GET, `companies/${profileData.companyId}`);
              });
            } else {
              setCompany(null);
              setLoading(false);
            }
          } else {
            setProfile(null);
            setCompany(null);
            setLoading(false);
          }
        }, (error) => {
          setLoading(false);
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });
      } else {
        setProfile(null);
        setCompany(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
      if (unsubCompany) unsubCompany();
    };
  }, []);

  const isAdmin = profile?.roles?.includes('admin') || profile?.email === 'jonmersha@gmail.com';

  const hasRole = (role: string) => {
    if (isAdmin) return true;
    return profile?.roles?.includes(role as any) || false;
  };

  return (
    <AuthContext.Provider value={{ user, profile, company, loading, isAdmin, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
