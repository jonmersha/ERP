import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile, Company } from '../types';
import { apiFetch } from '../utils/api';

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
    const fetchAuthData = async () => {
      try {
        const profileData = await apiFetch('/api/users/profile');
        if (profileData && !profileData.error) {
          setProfile(profileData);
          if (profileData.companyId) {
            const companyData = await apiFetch(`/api/users/company/${profileData.companyId}`);
            if (companyData && !companyData.error) {
              setCompany(companyData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching auth data:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        fetchAuthData();
      } else {
        setProfile(null);
        setCompany(null);
        setLoading(false);
      }
    });

    const interval = setInterval(() => {
      if (auth.currentUser) fetchAuthData();
    }, 60000); // Poll every 60 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
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
