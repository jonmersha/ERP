import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { 
  Factory, 
  Warehouse, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package
} from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: any; trend?: number; color: string }> = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-black/5"
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
    <h3 className="text-black/40 text-sm font-medium uppercase tracking-wider">{title}</h3>
    <p className="text-3xl font-serif font-bold text-black mt-1">{value}</p>
  </motion.div>
);

import { seedDatabase } from '../utils/seedData';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState({
    factories: 0,
    warehouses: 0,
    orders: 0,
    revenue: 0,
    lowStock: 0
  });

  const handleSeed = async () => {
    setIsSeeding(true);
    await seedDatabase();
    setIsSeeding(false);
  };

  useEffect(() => {
    const unsubFactories = onSnapshot(collection(db, 'factories'), (snap) => {
      setStats(prev => ({ ...prev, factories: snap.size }));
    });
    const unsubWarehouses = onSnapshot(collection(db, 'warehouses'), (snap) => {
      setStats(prev => ({ ...prev, warehouses: snap.size }));
    });
    const unsubOrders = onSnapshot(collection(db, 'salesOrders'), (snap) => {
      const total = snap.docs.reduce((acc, doc) => acc + (doc.data().totalAmount || 0), 0);
      setStats(prev => ({ ...prev, orders: snap.size, revenue: total }));
    });
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snap) => {
      const low = snap.docs.filter(doc => doc.data().quantity < 100).length;
      setStats(prev => ({ ...prev, lowStock: low }));
    });

    return () => {
      unsubFactories();
      unsubWarehouses();
      unsubOrders();
      unsubInventory();
    };
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[#5A5A40]">Operational Overview</h2>
          <p className="text-black/40 mt-1">Real-time performance metrics across all units</p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleSeed}
            disabled={isSeeding}
            className="text-xs font-bold uppercase tracking-widest bg-black/5 hover:bg-black/10 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
          >
            {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
          </button>
        )}
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
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-black/5 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold text-black">Recent Production Plans</h3>
            <button className="text-sm font-medium text-[#5A5A40] hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {/* Placeholder for list */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-[#F5F5F0]/50 border border-black/5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Package size={20} className="text-[#5A5A40]" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Wheat Flour 25kg</p>
                    <p className="text-xs text-black/40">Factory A • Batch #WF-00{i}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">5,000 Units</p>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">In Progress</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-black/5 p-8">
          <h3 className="text-xl font-serif font-bold text-black mb-8">Unit Distribution</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-black/60">Factories</span>
                <span className="font-bold">{stats.factories}</span>
              </div>
              <div className="h-2 bg-[#F5F5F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#5A5A40]" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-black/60">Warehouses</span>
                <span className="font-bold">{stats.warehouses}</span>
              </div>
              <div className="h-2 bg-[#F5F5F0] rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-black/60">Retail Outlets</span>
                <span className="font-bold">12</span>
              </div>
              <div className="h-2 bg-[#F5F5F0] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 p-6 rounded-2xl bg-[#5A5A40] text-white">
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
