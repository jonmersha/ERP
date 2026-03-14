import React from 'react';
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
  Menu, 
  X,
  TrendingUp,
  Warehouse,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'finance', 'store', 'procurement', 'sales', 'factory_manager'] },
    { name: 'Procurement', path: '/procurement', icon: ShoppingCart, roles: ['admin', 'procurement', 'finance', 'store'] },
    { name: 'Inventory', path: '/inventory', icon: Warehouse, roles: ['admin', 'store', 'factory_manager', 'sales'] },
    { name: 'Production', path: '/production', icon: Factory, roles: ['admin', 'factory_manager'] },
    { name: 'Sales', path: '/sales', icon: TrendingUp, roles: ['admin', 'sales', 'finance'] },
    { name: 'HR', path: '/hr', icon: Users, roles: ['admin'] },
    { name: 'Master Data', path: '/master-data', icon: Database, roles: ['admin', 'factory_manager'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    isAdmin || (profile?.role && item.roles.includes(profile.role))
  );

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-black/5 shadow-sm">
        <div className="p-6 border-bottom border-black/5">
          <h1 className="text-2xl font-serif font-bold text-[#5A5A40]">Cibus ERP</h1>
          <p className="text-xs text-black/40 uppercase tracking-widest mt-1">Food Complex Management</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-[#5A5A40] text-white shadow-md'
                  : 'text-black/60 hover:bg-black/5'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-black/5">
          <div className="flex items-center space-x-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40] font-bold">
              {profile?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">{profile?.name}</p>
              <p className="text-xs text-black/40 truncate capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-black/5 flex items-center justify-between px-4 z-50">
        <h1 className="text-xl font-serif font-bold text-[#5A5A40]">Cibus ERP</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-black/60">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="md:hidden fixed inset-0 bg-white z-40 pt-16"
          >
            <nav className="p-4 space-y-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-4 rounded-xl ${
                    location.pathname === item.path
                      ? 'bg-[#5A5A40] text-white'
                      : 'text-black/60'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-lg font-medium">{item.name}</span>
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-4 text-red-600"
              >
                <LogOut size={24} />
                <span className="text-lg font-medium">Sign Out</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-0 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
