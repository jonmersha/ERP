"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Factory, 
  Users, 
  LogOut, 
  TrendingUp,
  Warehouse,
  Database,
  CreditCard,
  Calendar,
  CheckCircle2,
  BookOpen,
  Wrench,
  Truck,
  ChevronDown,
  Sun,
  Moon,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, hasRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'finance', 'store', 'procurement', 'sales', 'factory_manager'] },
    { 
      name: 'Operations', 
      icon: Factory, 
      roles: ['admin', 'factory_manager', 'procurement', 'store'],
      submenu: [
        { name: 'Planning', path: '/planning', icon: Calendar },
        { name: 'Procurement', path: '/procurement', icon: ShoppingCart },
        { name: 'Inventory', path: '/inventory', icon: Warehouse },
        { name: 'Production', path: '/production', icon: Factory },
        { name: 'Recipes', path: '/recipes', icon: BookOpen },
        { name: 'Maintenance', path: '/maintenance', icon: Wrench },
        { name: 'Logistics', path: '/logistics', icon: Truck },
        { name: 'Quality', path: '/quality', icon: CheckCircle2 },
      ]
    },
    { 
      name: 'Sales & Finance', 
      icon: CreditCard, 
      roles: ['admin', 'sales', 'finance'],
      submenu: [
        { name: 'Sales', path: '/sales', icon: TrendingUp },
        { name: 'Finance', path: '/finance', icon: CreditCard },
      ]
    },
    { 
      name: 'Admin Panel', 
      path: '/admin', 
      icon: Shield, 
      roles: ['admin'] 
    },
    { 
      name: 'Administration', 
      icon: Database, 
      roles: ['admin'],
      submenu: [
        { name: 'HR', path: '/hr', icon: Users },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Master Data', path: '/master-data', icon: Database },
      ]
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="bg-[var(--color-shell)] text-[var(--color-shell-text)] border-b border-black/10 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 h-12 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight"><span className="text-white/60 text-sm font-normal ml-1">Sheger ERP</span></span>
            </div>
            {/* Mobile Hamburger Button */}
            <button 
              className="lg:hidden p-2 text-white/80"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <AnimatePresence>
              {isMobileMenuOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    className="fixed top-0 left-0 h-full w-64 bg-[var(--color-shell)] z-50 flex flex-col lg:hidden pt-12 shadow-xl"
                  >
                    <nav className="flex flex-col h-full overflow-y-auto">
                      {filteredNavItems.map((item) => (
                        <div key={item.name} className="w-full">
                          {item.submenu ? (
                            <button
                              onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)}
                              className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-colors text-white/80 hover:bg-[var(--color-shell-hover)]`}
                            >
                              <div className="flex items-center space-x-3">
                                <item.icon size={18} />
                                <span>{item.name}</span>
                              </div>
                              <ChevronDown size={14} className={`transform transition-transform ${openSubmenu === item.name ? 'rotate-180' : ''}`} />
                            </button>
                          ) : (
                            <Link
                              href={item.path!}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors text-white/80 hover:bg-[var(--color-shell-hover)]`}
                            >
                              <item.icon size={18} />
                              <span>{item.name}</span>
                            </Link>
                          )}
                          
                          {item.submenu && openSubmenu === item.name && (
                            <div className="bg-[var(--color-shell-hover)]">
                              {item.submenu.map(sub => (
                                <Link
                                  key={sub.path}
                                  href={sub.path}
                                  onClick={() => { setOpenSubmenu(null); setIsMobileMenuOpen(false); }}
                                  className="flex items-center space-x-3 px-8 py-3 text-sm text-white/70 hover:text-white"
                                >
                                  <sub.icon size={16} />
                                  <span>{sub.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </nav>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <nav className="hidden lg:flex items-center space-x-1 h-12">
              {filteredNavItems.map((item) => (
                <div key={item.name} className="relative group h-full flex items-center">
                  {item.submenu ? (
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)}
                      className={`flex items-center space-x-2 px-3 h-full text-sm transition-colors ${
                        openSubmenu === item.name ? 'bg-[var(--color-shell-hover)] text-white font-bold border-b-2 border-white' : 'text-white/80 hover:bg-[var(--color-shell-hover)] hover:text-white'
                      }`}
                    >
                      <item.icon size={16} />
                      <span>{item.name}</span>
                      <ChevronDown size={14} />
                    </button>
                  ) : (
                    <Link
                      href={item.path!}
                      className={`flex items-center space-x-2 px-3 h-full text-sm transition-colors ${
                        pathname === item.path ? 'bg-[var(--color-shell-hover)] text-white font-bold border-b-2 border-white' : 'text-white/80 hover:bg-[var(--color-shell-hover)] hover:text-white'
                      }`}
                    >
                      <item.icon size={16} />
                      <span>{item.name}</span>
                    </Link>
                  )}
                  
                  {item.submenu && openSubmenu === item.name && (
                    <div className="absolute top-full left-0 mt-0 w-48 bg-[var(--color-surface)] shadow-lg border border-[var(--color-border)] py-1 z-50">
                      {item.submenu.map(sub => (
                        <Link
                          key={sub.path}
                          href={sub.path}
                          onClick={() => { setOpenSubmenu(null); }}
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                        >
                          <sub.icon size={16} className="text-[var(--color-main)]" />
                          <span>{sub.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} className="p-2 text-white/80 hover:bg-[var(--color-shell-hover)] rounded-full transition-colors" title="Toggle Theme">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="flex items-center space-x-2 px-3 py-1 cursor-pointer hover:bg-[var(--color-shell-hover)] rounded-full transition-colors" title={profile?.name}>
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold border border-white/30">
                {profile?.name?.[0] || 'U'}
              </div>
            </div>
            <button onClick={handleSignOut} className="p-2 text-white/80 hover:bg-red-500/80 hover:text-white rounded-full transition-colors" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
