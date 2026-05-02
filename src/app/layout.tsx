import React from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ERP Management System',
  description: 'A comprehensive ERP system with Procurement and HR modules.',
  manifest: '/manifest.json',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Simple Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-8 shrink-0">
            <div className="font-bold text-xl tracking-tight text-blue-600">ERP System</div>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium">Dashboard</Link>
              <Link href="/procurement" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors">Procurement</Link>
              <Link href="/hr" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors">Human Resources</Link>
            </nav>
          </aside>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
