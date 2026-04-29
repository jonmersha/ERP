"use client";
import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { seedDatabase } from '../utils/seedData';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ShieldCheck, Building2, Plus, Users, ArrowRight, MapPin, Phone, Mail, Image as ImageIcon } from 'lucide-react';

const Login: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'login' | 'company-setup'>('login');
  const [tempUser, setTempUser] = useState<any>(null);
  const [companyMode, setCompanyMode] = useState<'join' | 'create'>('join');
  const [companyName, setCompanyName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  
  const router = useRouter();

  React.useEffect(() => {
    if (!authLoading) {
      if (user && profile?.companyId) {
        router.push('/');
      } else if (user && !profile?.companyId) {
        setTempUser(user);
        setStep('company-setup');
      }
    }
  }, [user, profile, authLoading, router]);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists() || !profileSnap.data()?.companyId) {
        setTempUser(user);
        setStep('company-setup');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error("Login error details:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        // Do not show an aggressive error for closing popup
        setError(null);
      } else {
        setError(err.message || 'Failed to login. Please check your browser console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setTempUser(null);
      setStep('login');
      setError(null);
    } catch (err: any) {
      console.error("Sign out error:", err);
      setError("Failed to sign out.");
    }
  };

  const handleCompanySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;
    setLoading(true);
    setError(null);

    try {
      let finalCompanyId = '';
      let finalRoles = ['sales'];
      let isNewCompany = false;

      if (companyMode === 'create') {
        // Create new company
        const companyRef = doc(collection(db, 'companies'));
        const newCompanyCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        await setDoc(companyRef, {
          id: companyRef.id,
          name: companyName,
          code: newCompanyCode,
          address: companyAddress,
          phone: companyPhone,
          email: companyEmail,
          logoUrl: companyLogo,
          ownerId: tempUser.uid,
          createdAt: new Date().toISOString()
        });
        
        finalCompanyId = companyRef.id;
        finalRoles = ['admin']; // Creator is admin
        isNewCompany = true;
      } else {
        // Join existing company
        const q = query(collection(db, 'companies'), where('code', '==', companyCode.toUpperCase()));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          throw new Error('Invalid company code. Please ask your administrator for the correct code.');
        }
        
        finalCompanyId = snap.docs[0].id;
      }

      // Create user profile BEFORE seeding database so security rules pass
      const profileRef = doc(db, 'users', tempUser.uid);
      await setDoc(profileRef, {
        uid: tempUser.uid,
        email: tempUser.email,
        name: tempUser.displayName || 'User',
        roles: finalRoles,
        companyId: finalCompanyId,
        createdAt: new Date().toISOString(),
      });

      // Seed database for new company after user profile is created
      if (isNewCompany) {
        try {
          await seedDatabase(finalCompanyId);
        } catch (seedError) {
          console.error("Failed to seed database, but company was created", seedError);
          // We don't throw here to avoid blocking login, but log the error
        }
      }

      router.push('/');
    } catch (err: any) {
      console.error("Company setup error details:", err);
      setError(err.message || 'Failed to setup company. Please check your browser console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md w-full bg-white dark:bg-[var(--color-surface)] rounded-sm shadow-md p-10 border border-[var(--color-border)]"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--color-main)] rounded-sm flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]">
                <ShieldCheck className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-light text-[var(--color-text)]">Sheger ERP</h1>
              <p className="text-[var(--color-text)]/60 mt-2 text-sm">Enterprise Identity Provider</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-sm mb-6 text-sm border border-red-200">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg)] p-3 rounded-sm transition-colors duration-200 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[var(--color-main)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-main)]">Sign in with Google</span>
                </>
              )}
            </button>

            <div className="mt-10 pt-6 border-t border-[var(--color-border)] text-center">
              <p className="text-xs text-[var(--color-text)]/40 uppercase tracking-widest font-normal">
                SAP Fiori Experience
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="company-setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white dark:bg-[var(--color-surface)] rounded-sm shadow-md p-10 border border-[var(--color-border)]"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--color-main)] rounded-sm flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]">
                <Building2 className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-light text-[var(--color-text)]">System Configuration</h1>
              <p className="text-[var(--color-text)]/60 mt-2 text-sm">Connect to an existing workspace or initialize a new one</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-sm mb-6 text-sm border border-red-200">
                {error}
              </div>
            )}

            <div className="flex p-1 bg-[var(--color-bg)] rounded-sm mb-8 border border-[var(--color-border)]">
              <button
                onClick={() => { setCompanyMode('join'); setError(null); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-sm text-sm transition-colors ${companyMode === 'join' ? 'bg-white dark:bg-[var(--color-surface)] text-[var(--color-main)] font-medium shadow-sm border border-[var(--color-border)]' : 'text-[var(--color-text)]/60 hover:text-[var(--color-text)] cursor-pointer'}`}
              >
                <Users size={16} />
                <span>Join Workspace</span>
              </button>
              <button
                onClick={() => { setCompanyMode('create'); setError(null); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-sm text-sm transition-colors ${companyMode === 'create' ? 'bg-white dark:bg-[var(--color-surface)] text-[var(--color-main)] font-medium shadow-sm border border-[var(--color-border)]' : 'text-[var(--color-text)]/60 hover:text-[var(--color-text)] cursor-pointer'}`}
              >
                <Plus size={16} />
                <span>Initialize Target</span>
              </button>
            </div>

            <form onSubmit={handleCompanySetup} className="space-y-6">
              {companyMode === 'join' ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--color-text)]/60 uppercase">Workspace ID</label>
                  <input
                    required
                    type="text"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    placeholder="e.g. A1B2C3"
                    className="w-full p-3 bg-white dark:bg-[var(--color-bg)] rounded-sm border border-[var(--color-border)] focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)] font-mono text-center uppercase text-[var(--color-text)]"
                  />
                  <p className="text-xs text-[var(--color-text)]/50 mt-1">Contact your system administrator for the ID.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--color-text)]/60 uppercase">Organization Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40" size={16} />
                      <input
                        required
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Global Foods"
                        className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[var(--color-bg)] rounded-sm border border-[var(--color-border)] focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)] text-sm text-[var(--color-text)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--color-text)]/60 uppercase">System Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40" size={16} />
                      <input
                        required
                        type="text"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="Location"
                        className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[var(--color-bg)] rounded-sm border border-[var(--color-border)] focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)] text-sm text-[var(--color-text)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--color-text)]/60 uppercase">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40" size={16} />
                        <input
                          required
                          type="tel"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="+..."
                          className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[var(--color-bg)] rounded-sm border border-[var(--color-border)] focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)] text-sm text-[var(--color-text)]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--color-text)]/60 uppercase">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40" size={16} />
                        <input
                          required
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="..."
                          className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[var(--color-bg)] rounded-sm border border-[var(--color-border)] focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)] text-sm text-[var(--color-text)]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--color-text)]/60 uppercase">Logo URI (Optional)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40" size={16} />
                      <input
                        type="url"
                        value={companyLogo}
                        onChange={(e) => setCompanyLogo(e.target.value)}
                        placeholder="https://..."
                        className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[var(--color-bg)] rounded-sm border border-[var(--color-border)] focus:border-[var(--color-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-main)] text-sm text-[var(--color-text)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-[var(--color-main)] hover:bg-[var(--color-main)]/90 text-white p-3 rounded-sm text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{companyMode === 'join' ? 'Connect Target' : 'Deploy Target'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[var(--color-border)] text-center">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="text-xs font-medium text-[var(--color-text)]/60 hover:text-[var(--color-main)] transition-colors disabled:opacity-50 inline-flex items-center space-x-1"
              >
                <span>Change Authorization Identity</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
