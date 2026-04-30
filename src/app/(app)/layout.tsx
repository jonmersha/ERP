"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('ProtectedLayout: loading=', loading, 'user=', !!user, 'profile=', !!profile);
    if (!loading) {
      if (!user || !profile?.companyId) {
        console.log('ProtectedLayout: redirecting to /login');
        router.push('/login');
      } else if (pathname === '/admin' && !isAdmin) {
        console.log('ProtectedLayout: redirecting to /');
        router.push('/');
      }
    }
  }, [user, profile, loading, isAdmin, pathname, router]);

  if (loading) {
    console.log('ProtectedLayout: still loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="w-12 h-12 border-4 border-[var(--color-main)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile?.companyId) {
    return null; // Will redirect
  }

  if (pathname === '/admin' && !isAdmin) {
    return null; // Will redirect
  }

  return <Layout>{children}</Layout>;
}
