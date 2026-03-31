import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Shield
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
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
    navigate('/login');
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
      <header className="bg-[var(--color-surface)] border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[var(--color-main)] rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
              <h1 className="text-2xl font-serif font-bold text-[var(--color-text)] tracking-tight">Sheger <span className="text-[var(--color-main)]">ERP</span></h1>
            </div>
            <nav className="hidden md:flex items-center space-x-1">
              {filteredNavItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.submenu ? (
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.name ? null : item.name)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        openSubmenu === item.name ? 'bg-black/5 text-[var(--color-main)]' : 'text-[var(--color-text)]/60 hover:text-[var(--color-main)]'
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.name}</span>
                      <ChevronDown size={14} />
                    </button>
                  ) : (
                    <Link
                      to={item.path!}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.path ? 'bg-[var(--color-main)] text-white' : 'text-[var(--color-text)]/60 hover:text-[var(--color-main)]'
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  )}
                  
                  {item.submenu && openSubmenu === item.name && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--color-surface)] rounded-xl shadow-lg border border-black/5 py-2 z-50">
                      {item.submenu.map(sub => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          onClick={() => setOpenSubmenu(null)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-[var(--color-text)]/60 hover:bg-black/5 hover:text-[var(--color-main)]"
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
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 text-[var(--color-text)]/40 hover:text-[var(--color-main)]">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--color-main)]/10 rounded-full">
              <div className="w-6 h-6 rounded-full bg-[var(--color-main)] flex items-center justify-center text-white text-xs font-bold">
                {profile?.name?.[0] || 'U'}
              </div>
              <span className="text-sm font-medium text-[var(--color-main)]">{profile?.name}</span>
            </div>
            <button onClick={handleSignOut} className="text-[var(--color-text)]/40 hover:text-red-600">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
