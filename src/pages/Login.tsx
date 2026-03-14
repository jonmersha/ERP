import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const profileRef = doc(db, 'users', user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        // Create default profile for first-time login
        const isDefaultAdmin = user.email === 'jonmersha@gmail.com';
        await setDoc(profileRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'User',
          role: isDefaultAdmin ? 'admin' : 'sales', // Default role
          createdAt: new Date().toISOString(),
        });
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-black/5"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#5A5A40] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#5A5A40]">Cibus ERP</h1>
          <p className="text-black/40 mt-2">Enterprise Food Complex Management</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-black/5 hover:border-[#5A5A40] hover:bg-[#5A5A40]/5 p-4 rounded-2xl transition-all duration-300 group disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span className="font-semibold text-black/70 group-hover:text-[#5A5A40]">Continue with Google</span>
            </>
          )}
        </button>

        <div className="mt-8 pt-8 border-t border-black/5 text-center">
          <p className="text-xs text-black/30 uppercase tracking-widest font-medium">
            Secure Access for Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
