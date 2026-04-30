"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { apiService } from '../services/apiService';
import { UserProfile, Company } from '../types';

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        console.log('User signed in. Fetching profile/company from backend.');
        try {
          const profile = await apiService.get<UserProfile>(`users/${user.uid}`);
          setProfile(profile);

          if (profile.companyId) {
            const company = await apiService.get<Company>(`companies/${profile.companyId}`);
            setCompany(company);
          }
        } catch (e) {
          console.error("Failed to fetch profile/company", e);
        }
      } else {
        console.log('No user signed in');
        setProfile(null);
        setCompany(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
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
