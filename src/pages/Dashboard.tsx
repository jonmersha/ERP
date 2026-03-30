import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, limit, where } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { seedDatabase } from '../utils/seedData';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { 
  Factory, 
  Warehouse, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Building2,
  MapPin,
  Phone,
  Mail,
  Settings
} from 'lucide-react';
import EditCompanyModal from '../components/EditCompanyModal';

const StatCard: React.FC<{ title: string; value: string | number; icon: any; trend?: number; color: string }> = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-[var(--color-surface)] p-6 rounded-3xl shadow-sm border border-[var(--color-text)]/5"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center space-x-1 text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          <span>{trend >= 0 ? '+' : ''}{trend}%</span>
          {trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        </div>
      )}
    </div>
    <h3 className="text-[var(--color-text)]/40 text-sm font-medium uppercase tracking-wider">{title}</h3>
    <p className="text-3xl font-serif font-bold text-[var(--color-text)] mt-1">{value}</p>
  </motion.div>
);

import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { isAdmin, profile, company } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [stats, setStats] = useState({
    factories: 0,
    warehouses: 0,
    orders: 0,
    revenue: 0,
    lowStock: 0
  });

  const handleSeed = async () => {
    if (!profile?.companyId) return;
    setIsSeeding(true);
    await seedDatabase(profile.companyId);
    setIsSeeding(false);
  };

  useEffect(() => {
    if (!profile?.companyId) return;

    const companyFilter = where('companyId', '==', profile.companyId);

    const unsubFactories = onSnapshot(query(collection(db, 'factories'), companyFilter), (snap) => {
      setStats(prev => ({ ...prev, factories: snap.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'factories'));

    const unsubWarehouses = onSnapshot(query(collection(db, 'warehouses'), companyFilter), (snap) => {
      setStats(prev => ({ ...prev, warehouses: snap.size }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'warehouses'));

    const unsubOrders = onSnapshot(query(collection(db, 'salesOrders'), companyFilter), (snap) => {
      const total = snap.docs.reduce((acc, doc) => acc + (doc.data().totalAmount || 0), 0);
      setStats(prev => ({ ...prev, orders: snap.size, revenue: total }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'salesOrders'));

    const unsubInventory = onSnapshot(query(collection(db, 'inventory'), companyFilter), (snap) => {
      const low = snap.docs.filter(doc => doc.data().quantity < 100).length;
      setStats(prev => ({ ...prev, lowStock: low }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'inventory'));

    return () => {
      unsubFactories();
      unsubWarehouses();
      unsubOrders();
      unsubInventory();
    };
  }, [profile?.companyId]);

  return (
    <div className="space-y-8">
      {/* Company Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[var(--color-surface)] rounded-[2rem] border border-[var(--color-text)]/5 shadow-sm min-h-[200px]"
      >
        {company?.bannerUrl ? (
          <div className="absolute inset-0">
            <img src={company.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-20" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-surface)] via-[var(--color-surface)]/80 to-transparent" />
          </div>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-main)]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600/5 rounded-full -ml-24 -mb-24 blur-3xl" />
          </>
        )}
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[var(--color-surface)] rounded-3xl flex items-center justify-center shadow-sm overflow-hidden border border-[var(--color-text)]/5 shrink-0">
            {company?.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Building2 size={48} className="text-[var(--color-main)]/40" />
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--color-text)]">{company?.name || 'Your Organization'}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-[var(--color-text)]/60">
                  {company?.address && (
                    <div className="flex items-center space-x-1.5">
                      <MapPin size={16} className="text-[var(--color-main)]" />
                      <span>{company.address}</span>
                    </div>
                  )}
                  {company?.phone && (
                    <div className="flex items-center space-x-1.5">
                      <Phone size={16} className="text-[var(--color-main)]" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company?.email && (
                    <div className="flex items-center space-x-1.5">
                      <Mail size={16} className="text-[var(--color-main)]" />
                      <span>{company.email}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-end space-y-3">
                <div className="px-4 py-1.5 bg-[var(--color-main)]/10 rounded-full text-[var(--color-main)] text-xs font-bold uppercase tracking-widest">
                  Code: {company?.code}
                </div>
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-2 bg-[var(--color-text)]/5 hover:bg-[var(--color-text)]/10 rounded-xl transition-all text-[var(--color-text)]/60"
                        title="Edit Company"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={handleSeed}
                        disabled={isSeeding}
                        className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-main)] hover:text-[var(--color-text)] transition-colors"
                      >
                        {isSeeding ? 'Seeding...' : 'Seed Data'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {company && (
        <EditCompanyModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          company={company} 
        />
      )}

      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[var(--color-main)]">Operational Overview</h2>
          <p className="text-[var(--color-text)]/40 mt-1 text-sm">Real-time performance metrics across all units</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Factories" 
          value={stats.factories} 
          icon={Factory} 
          trend={12}
          color="bg-[#5A5A40]" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon={TrendingUp} 
          trend={8}
          color="bg-emerald-600" 
        />
        <StatCard 
          title="Sales Orders" 
          value={stats.orders} 
          icon={ShoppingCart} 
          trend={-3}
          color="bg-blue-600" 
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStock} 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold text-[var(--color-text)]">Recent Production Plans</h3>
            <button className="text-sm font-medium text-[var(--color-main)] hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {/* Placeholder for list */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg)]/50 border border-[var(--color-text)]/5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-[var(--color-surface)] rounded-xl flex items-center justify-center shadow-sm">
                    <Package size={20} className="text-[var(--color-main)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--color-text)]">Wheat Flour 25kg</p>
                    <p className="text-xs text-[var(--color-text)]/40">Factory A • Batch #WF-00{i}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[var(--color-text)]">5,000 Units</p>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">In Progress</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 p-8">
          <h3 className="text-xl font-serif font-bold text-[var(--color-text)] mb-8">Unit Distribution</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text)]/60">Factories</span>
                <span className="font-bold">{stats.factories}</span>
              </div>
              <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-main)]" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text)]/60">Warehouses</span>
                <span className="font-bold">{stats.warehouses}</span>
              </div>
              <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text)]/60">Retail Outlets</span>
                <span className="font-bold">12</span>
              </div>
              <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-6 rounded-2xl bg-[var(--color-main)] text-white">
            <h4 className="font-bold mb-2">System Status</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              All systems operational. Last sync: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
