import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, limit, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { seedDatabase } from '../utils/seedData';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { 
  Factory as FactoryIcon,
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
  Settings,
  ClipboardList,
  Truck,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import EditCompanyModal from '../components/EditCompanyModal';
import { Product, Factory as FactoryType } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; icon: any; trend?: number; color: string; onClick?: () => void }> = ({ title, value, icon: Icon, trend, color, onClick }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    onClick={onClick}
    className={`bg-[var(--color-surface)] p-6 rounded-3xl shadow-sm border border-[var(--color-text)]/5 ${onClick ? 'cursor-pointer' : ''}`}
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
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

const Dashboard: React.FC = () => {
  const { isAdmin, profile, company } = useAuth();
  const navigate = useNavigate();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);
  const [stats, setStats] = useState({
    factories: 0,
    warehouses: 0,
    orders: 0,
    revenue: 0,
    lowStock: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [allRuns, setAllRuns] = useState<any[]>([]);
  const [procurementStats, setProcurementStats] = useState<any[]>([]);
  const [planningStats, setPlanningStats] = useState<any[]>([]);

  const productionStats = React.useMemo(() => {
    const productSummary: Record<string, { name: string, actual: number, target: number }> = {};
    
    allRuns.forEach(run => {
      if (!productSummary[run.productId]) {
        const product = products.find(p => p.id === run.productId);
        productSummary[run.productId] = { name: product?.name || run.productName || 'Unknown', actual: 0, target: 0 };
      }
      productSummary[run.productId].actual += run.actualQuantity || 0;
      productSummary[run.productId].target += run.targetQuantity || 0;
    });

    return Object.values(productSummary).slice(0, 5);
  }, [allRuns, products]);

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

    const unsubProducts = onSnapshot(query(collection(db, 'products'), companyFilter), (snap) => {
      const productsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    // Fetch recent orders
    const unsubRecentOrders = onSnapshot(query(collection(db, 'salesOrders'), companyFilter, orderBy('createdAt', 'desc'), limit(3)), (snap) => {
      const ordersData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentOrders(ordersData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'salesOrders'));

    // Fetch recent production runs
    const unsubRecentRuns = onSnapshot(query(collection(db, 'productionRuns'), companyFilter, orderBy('startDate', 'desc'), limit(3)), (snap) => {
      const runsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentRuns(runsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'productionRuns'));

    // Fetch Production Data for Charts
    const unsubProduction = onSnapshot(query(collection(db, 'productionRuns'), companyFilter), (snap) => {
      const runsData = snap.docs.map(doc => doc.data());
      setAllRuns(runsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'productionRuns'));

    // Fetch Procurement Data for Charts
    const unsubProcurement = onSnapshot(query(collection(db, 'procurementPlans'), companyFilter), (snap) => {
      const plans = snap.docs.map(doc => doc.data());
      const statusCounts = {
        pending: 0,
        ordered: 0,
        received: 0
      };
      
      plans.forEach(plan => {
        const status = (plan.status || 'pending').toLowerCase();
        if (status in statusCounts) {
          statusCounts[status as keyof typeof statusCounts]++;
        }
      });

      setProcurementStats([
        { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
        { name: 'Ordered', value: statusCounts.ordered, color: '#3b82f6' },
        { name: 'Received', value: statusCounts.received, color: '#10b981' }
      ]);
    });

    // Fetch Planning Data
    const unsubPlanning = onSnapshot(query(collection(db, 'productionPlans'), companyFilter), (snap) => {
      const plans = snap.docs.map(doc => doc.data());
      const monthlyData: Record<string, number> = {};
      
      plans.forEach(plan => {
        const date = new Date(plan.startDate);
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + (plan.targetQuantity || 0);
      });

      setPlanningStats(Object.entries(monthlyData).map(([name, value]) => ({ name, value })));
    });

    return () => {
      unsubFactories();
      unsubWarehouses();
      unsubOrders();
      unsubInventory();
      unsubProducts();
      unsubRecentOrders();
      unsubRecentRuns();
      unsubProduction();
      unsubProcurement();
      unsubPlanning();
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
                      <button 
                        onClick={async () => {
                          setIsSeeding(true);
                          const companiesSnap = await getDocs(collection(db, 'companies'));
                          for (const doc of companiesSnap.docs) {
                            await seedDatabase(doc.id);
                          }
                          setIsSeeding(false);
                          alert('Seeding complete for all companies!');
                        }}
                        disabled={isSeeding}
                        className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-[var(--color-text)] transition-colors ml-4"
                      >
                        {isSeeding ? 'Seeding All...' : 'Seed All'}
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
          icon={FactoryIcon} 
          trend={12}
          color="bg-[var(--color-main)]" 
          onClick={() => navigate('/production')}
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${stats.revenue.toLocaleString()}`} 
          icon={TrendingUp} 
          trend={8}
          color="bg-[var(--color-main)]" 
          onClick={() => navigate('/finance')}
        />
        <StatCard 
          title="Sales Orders" 
          value={stats.orders} 
          icon={ShoppingCart} 
          trend={-3}
          color="bg-[var(--color-main)]" 
          onClick={() => navigate('/sales')}
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStock} 
          icon={AlertTriangle} 
          color="bg-[var(--color-accent)]" 
          onClick={() => navigate('/inventory')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Production Progress Chart */}
        <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-[var(--color-text)]">Production Progress</h3>
              <p className="text-sm text-[var(--color-text)]/40">Actual vs Target Quantity by Product</p>
            </div>
            <Activity className="text-[var(--color-main)]" size={24} />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text)', opacity: 0.5 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text)', opacity: 0.5 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Bar dataKey="target" fill="var(--color-bg)" radius={[4, 4, 0, 0]} name="Target" />
                <Bar dataKey="actual" fill="var(--color-main)" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Procurement Status Chart */}
        <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-[var(--color-text)]">Procurement Status</h3>
              <p className="text-sm text-[var(--color-text)]/40">Distribution of material plans</p>
            </div>
            <Truck className="text-[var(--color-main)]" size={24} />
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={procurementStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {procurementStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col space-y-2 ml-4">
              {procurementStats.map((stat, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-xs font-medium text-[var(--color-text)]/60">{stat.name}: {stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Planning Trend Chart */}
        <div className="lg:col-span-3 bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-[var(--color-text)]">Planning Trend</h3>
              <p className="text-sm text-[var(--color-text)]/40">Monthly target production volume</p>
            </div>
            <ClipboardList className="text-[var(--color-main)]" size={24} />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={planningStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text)', opacity: 0.5 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text)', opacity: 0.5 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}
                />
                <Line type="monotone" dataKey="value" stroke="var(--color-main)" strokeWidth={3} dot={{ r: 6, fill: 'var(--color-main)', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} name="Planned Qty" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Recent Sales Orders */}
          <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-serif font-bold text-[var(--color-text)]">Recent Sales Orders</h3>
              <button 
                onClick={() => navigate('/sales')}
                className="text-sm font-medium text-[var(--color-main)] hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.length === 0 && <p className="text-sm text-[var(--color-text)]/40">No recent sales orders.</p>}
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg)]/50 border border-[var(--color-text)]/5 cursor-pointer hover:bg-[var(--color-text)]/80 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-[var(--color-surface)] rounded-xl flex items-center justify-center shadow-sm">
                      <ShoppingCart size={20} className="text-[var(--color-main)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{order.outletName || 'Unknown Outlet'}</p>
                      <p className="text-xs text-[var(--color-text)]/40">{order.items?.length || 0} items • {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-text)]">${(order.totalAmount || 0).toLocaleString()}</p>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${
                      order.status === 'delivered' ? 'text-emerald-600 bg-emerald-50' : 
                      order.status === 'shipped' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Production Runs */}
          <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-serif font-bold text-[var(--color-text)]">Manufacturing Schedule</h3>
              <button 
                onClick={() => navigate('/production')}
                className="text-sm font-medium text-[var(--color-main)] hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentRuns.length === 0 && <p className="text-sm text-[var(--color-text)]/40">No recent production runs.</p>}
                {recentRuns.map((run) => {
                  const progress = run.quantity > 0 ? Math.round((run.quantityProduced / run.quantity) * 100) : 0;
                  return (
                    <div 
                      key={run.id} 
                      onClick={() => setSelectedRun(run)}
                      className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-bg)]/50 border border-[var(--color-text)]/5 cursor-pointer hover:bg-[var(--color-text)]/80 transition-all"
                    >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-[var(--color-surface)] rounded-xl flex items-center justify-center shadow-sm">
                        <FactoryIcon size={20} className="text-[var(--color-main)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text)]">
                          {products.find(p => p.id === run.productId)?.name || run.productName || 'Unknown Product'}
                        </p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <p className="text-[10px] font-bold text-[var(--color-text)]/40 uppercase tracking-widest">
                            {run.quantityProduced.toLocaleString()} / {run.quantity.toLocaleString()} units
                          </p>
                          {run.status !== 'completed' && (
                            <span className="text-[10px] font-bold text-[var(--color-main)] uppercase tracking-widest">
                              • {(run.quantity - run.quantityProduced).toLocaleString()} left
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end space-y-1">
                      <div className="w-24 h-1.5 bg-[var(--color-bg)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-main)]" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${
                        run.status === 'completed' ? 'text-emerald-600 bg-emerald-50' : 
                        run.status === 'in_progress' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'
                      }`}>
                        {run.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 p-8">
          <h3 className="text-xl font-serif font-bold text-[var(--color-text)] mb-8">Unit Distribution</h3>
          <div className="space-y-6">
            <div className="space-y-2 cursor-pointer group" onClick={() => navigate('/production')}>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text)]/60 group-hover:text-[var(--color-main)] transition-colors">Factories</span>
                <span className="font-bold">{stats.factories}</span>
              </div>
              <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-main)]" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="space-y-2 cursor-pointer group" onClick={() => navigate('/inventory')}>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text)]/60 group-hover:text-blue-600 transition-colors">Warehouses</span>
                <span className="font-bold">{stats.warehouses}</span>
              </div>
              <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="space-y-2 cursor-pointer group" onClick={() => navigate('/sales')}>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text)]/60 group-hover:text-amber-500 transition-colors">Retail Outlets</span>
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

      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title="Sales Order Details"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Order ID</p>
                <p className="text-lg font-mono font-bold text-[var(--color-main)]">#{selectedOrder.id?.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Status</p>
                <span className={`inline-block mt-1 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                  selectedOrder.status === 'delivered' ? 'text-emerald-600 bg-emerald-50' : 
                  selectedOrder.status === 'shipped' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'
                }`}>
                  {selectedOrder.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Customer Outlet</p>
                <p className="font-bold text-[var(--color-text)]">{selectedOrder.outletName || 'Unknown Outlet'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Order Date</p>
                <p className="font-bold text-[var(--color-text)]">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Order Items</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5">
                    <div>
                      <p className="font-bold text-sm text-[var(--color-text)]">{item.productName}</p>
                      <p className="text-xs text-[var(--color-text)]/40">Qty: {item.quantity} × ${item.price.toLocaleString()}</p>
                    </div>
                    <p className="font-bold text-[var(--color-text)]">${(item.quantity * item.price).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--color-text)]/5 flex justify-between items-center">
              <p className="text-sm font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Total Amount</p>
              <p className="text-2xl font-serif font-bold text-[var(--color-text)]">
                ${(selectedOrder.totalAmount || 0).toLocaleString()}
              </p>
            </div>

            <button 
              onClick={() => {
                setSelectedOrder(null);
                navigate('/sales');
              }}
              className="w-full bg-[var(--color-main)] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[var(--color-main)]/90 transition-all"
            >
              Go to Sales Management
            </button>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={!!selectedRun} 
        onClose={() => setSelectedRun(null)} 
        title="Production Run Details"
      >
        {selectedRun && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-text)]/5">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text)]/40 mb-1">Run ID</p>
                <p className="font-mono font-bold text-[var(--color-main)]">#{selectedRun.id.slice(0, 12)}</p>
              </div>
              <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-text)]/5">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text)]/40 mb-1">Status</p>
                <div className={`inline-block mt-1 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${
                  selectedRun.status === 'completed' ? 'text-emerald-600 bg-emerald-50' : 
                  selectedRun.status === 'in_progress' ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50'
                }`}>
                  {selectedRun.status.replace('_', ' ')}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[var(--color-main)]/10 rounded-2xl text-[var(--color-main)]">
                  <FactoryIcon size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text)]/40">Product</p>
                  <p className="font-bold text-[var(--color-text)]">
                    {products.find(p => p.id === selectedRun.productId)?.name || selectedRun.productName || 'Unknown Product'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-bg)] p-6 rounded-3xl border border-[var(--color-text)]/5">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text)]/40 mb-1">Production Progress</p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {selectedRun.quantityProduced.toLocaleString()} / {selectedRun.quantity.toLocaleString()}
                    <span className="text-sm text-[var(--color-text)]/40 ml-2">units</span>
                  </p>
                  {selectedRun.status !== 'completed' && (
                    <p className="text-xs text-[var(--color-main)]/60 mt-1">
                      {(selectedRun.quantity - selectedRun.quantityProduced).toLocaleString()} units remaining
                    </p>
                  )}
                </div>
                <p className="text-xl font-bold text-[var(--color-main)]">
                  {selectedRun.quantity > 0 ? Math.round((selectedRun.quantityProduced / selectedRun.quantity) * 100) : 0}%
                </p>
              </div>
              <div className="h-3 bg-[var(--color-surface)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--color-main)] rounded-full"
                  style={{ width: `${selectedRun.quantity > 0 ? (selectedRun.quantityProduced / selectedRun.quantity) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text)]/40 mb-1">Start Date</p>
                <p className="font-medium text-[var(--color-text)]">{new Date(selectedRun.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-text)]/40 mb-1">Last Updated</p>
                <p className="font-medium text-[var(--color-text)]">
                  {selectedRun.updatedAt ? new Date(selectedRun.updatedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedRun(null);
                navigate('/production');
              }}
              className="w-full bg-[var(--color-main)] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[var(--color-main)]/90 transition-all"
            >
              Go to Production Management
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
