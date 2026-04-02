import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, ShieldCheck, Building2, Plus, Users, ArrowRight, MapPin, Phone, Mail, Image as ImageIcon } from 'lucide-react';
import { apiFetch } from '../utils/api';

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
  
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!authLoading && user && profile?.companyId) {
      navigate('/');
    }
  }, [user, profile, authLoading, navigate]);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setLoading(true);
      const user = result.user;

      // Check if profile exists via API
      try {
        const profileData = await apiFetch('/api/users/profile');
        if (profileData && profileData.companyId) {
          navigate('/');
        } else {
          setTempUser(user);
          setStep('company-setup');
        }
      } catch (err) {
        // Profile not found or other error, proceed to setup
        setTempUser(user);
        setStep('company-setup');
      }
    } catch (err: any) {
      console.error("Login error details:", err);
      setError(err.message || 'Failed to login. Please check your browser console for details.');
    } finally {
      setLoading(false);
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

      if (companyMode === 'create') {
        // Create new company via API
        const companyData = await apiFetch('/api/users/company', {
          method: 'POST',
          body: JSON.stringify({
            name: companyName,
            address: companyAddress,
            phone: companyPhone,
            email: companyEmail,
            logoUrl: companyLogo
          })
        });

        finalCompanyId = companyData.id;
        finalRoles = ['admin']; // Creator is admin
      } else {
        // Join existing company via API
        const companyData = await apiFetch(`/api/users/company/code/${companyCode.toUpperCase()}`);
        if (!companyData || companyData.error) {
          throw new Error('Invalid company code');
        }
        finalCompanyId = companyData.id;
      }

      // Create user profile via API
      await apiFetch('/api/users/profile', {
        method: 'POST',
        body: JSON.stringify({
          email: tempUser.email,
          name: tempUser.displayName || 'User',
          roles: finalRoles,
          companyId: finalCompanyId
        })
      });

      navigate('/');
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
            className="max-w-md w-full bg-[var(--color-surface)] rounded-3xl shadow-xl p-8 border border-[var(--color-text)]/5"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--color-main)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldCheck className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-serif font-bold text-[var(--color-main)]">Sheger ERP</h1>
              <p className="text-[var(--color-text)]/40 mt-2">Enterprise Food Complex Management</p>
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 text-sm border border-red-500/20">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-[var(--color-surface)] border-2 border-[var(--color-text)]/5 hover:border-[var(--color-main)] hover:bg-[var(--color-main)]/5 p-4 rounded-2xl transition-all duration-300 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-[var(--color-main)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  <span className="font-semibold text-[var(--color-text)]/70 group-hover:text-[var(--color-main)]">Continue with Google</span>
                </>
              )}
            </button>

            <div className="mt-8 pt-8 border-t border-[var(--color-text)]/5 text-center">
              <p className="text-xs text-[var(--color-text)]/30 uppercase tracking-widest font-medium">
                Multi-Tenant Enterprise Resource Planning
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="company-setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-[var(--color-surface)] rounded-3xl shadow-xl p-8 border border-[var(--color-text)]/5"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--color-main)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Building2 className="text-white" size={32} />
              </div>
              <h1 className="text-2xl font-serif font-bold text-[var(--color-text)]">Company Setup</h1>
              <p className="text-[var(--color-text)]/40 mt-2">Join an existing organization or create a new one</p>
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 text-sm border border-red-500/20">
                {error}
              </div>
            )}

            <div className="flex p-1 bg-[var(--color-text)]/5 rounded-xl mb-8">
              <button
                onClick={() => setCompanyMode('join')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-bold transition-all ${companyMode === 'join' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text)]/40'}`}
              >
                <Users size={16} />
                <span>Join Company</span>
              </button>
              <button
                onClick={() => setCompanyMode('create')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-bold transition-all ${companyMode === 'create' ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text)]/40'}`}
              >
                <Plus size={16} />
                <span>Create New</span>
              </button>
            </div>

            <form onSubmit={handleCompanySetup} className="space-y-6">
              {companyMode === 'join' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Company Code</label>
                  <input
                    required
                    type="text"
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 font-mono text-lg tracking-widest text-center uppercase text-[var(--color-text)]"
                  />
                  <p className="text-[10px] text-[var(--color-text)]/30 mt-2">Ask your administrator for the company join code.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]/20" size={20} />
                      <input
                        required
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Cibus Foods Ltd"
                        className="w-full pl-12 pr-4 py-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]/20" size={20} />
                      <input
                        required
                        type="text"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="Street, City, Country"
                        className="w-full pl-12 pr-4 py-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]/20" size={18} />
                        <input
                          required
                          type="tel"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="+251..."
                          className="w-full pl-12 pr-4 py-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]/20" size={18} />
                        <input
                          required
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="contact@company.com"
                          className="w-full pl-12 pr-4 py-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Logo URL (Optional)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]/20" size={20} />
                      <input
                        type="url"
                        value={companyLogo}
                        onChange={(e) => setCompanyLogo(e.target.value)}
                        placeholder="https://..."
                        className="w-full pl-12 pr-4 py-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-[var(--color-text)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-[var(--color-text)] text-[var(--color-bg)] p-4 rounded-2xl font-bold hover:bg-[var(--color-text)]/80 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-[var(--color-bg)] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{companyMode === 'join' ? 'Join Organization' : 'Initialize Company'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
