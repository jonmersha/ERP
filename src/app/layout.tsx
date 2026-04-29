import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Sheger ERP',
  description: 'ERP built with Next.js',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
