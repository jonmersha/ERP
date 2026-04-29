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
    if (!loading) {
      if (!user || !profile?.companyId) {
        router.push('/login');
      } else if (pathname === '/admin' && !isAdmin) {
        router.push('/');
      }
    }
  }, [user, profile, loading, isAdmin, pathname, router]);

  if (loading) {
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
