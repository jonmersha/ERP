import React, { useState } from 'react';
import { useHRData } from '../hooks/useHRData';
import { createEmployee } from '../services/hrService';
import { motion } from 'motion/react';
import { Users, UserPlus, Search, Briefcase, Mail, DollarSign, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';
import StatsCard from '../components/common/StatsCard';

const HR: React.FC = () => {
  const { employees, factories, loading } = useHRData();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: '',
    department: '',
    email: '',
    salary: 0,
    hireDate: new Date().toISOString().split('T')[0],
    factoryId: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createEmployee(form);
      setIsModalOpen(false);
      setForm({
        name: '',
        role: '',
        department: '',
        email: '',
        salary: 0,
        hireDate: new Date().toISOString().split('T')[0],
        factoryId: ''
      });
    } catch (error) {
      console.error("Error adding employee:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.role.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#5A5A40]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[#5A5A40]">Human Resources</h2>
          <p className="text-black/40 mt-1">Manage workforce across all production units</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-[#5A5A40] text-white px-6 py-3 rounded-2xl shadow-lg hover:bg-[#4A4A30] transition-all"
        >
          <UserPlus size={20} />
          <span className="font-bold">Add Employee</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Workforce"
          value={employees.length}
          icon={Users}
          color="indigo"
        />
        <StatsCard 
          title="Departments"
          value={new Set(employees.map(e => e.department)).size}
          icon={Briefcase}
          color="emerald"
        />
        <StatsCard 
          title="Monthly Payroll"
          value={`$${totalPayroll.toLocaleString()}`}
          icon={DollarSign}
          color="amber"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-serif font-bold text-lg text-black">Employee Directory</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" size={18} />
            <input 
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredEmployees.map((emp) => (
            <motion.div 
              key={emp.id}
              whileHover={{ y: -5 }}
              className="bg-[#F5F5F0]/50 p-6 rounded-3xl border border-black/5 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-[#5A5A40] text-white rounded-2xl flex items-center justify-center font-serif text-xl font-bold">
                  {emp.name[0]}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{emp.department}</p>
                  <p className="font-bold text-black">{emp.role}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-serif font-bold text-lg text-black">{emp.name}</h4>
                <div className="flex items-center text-xs text-black/40 mt-1">
                  <Mail size={12} className="mr-1" />
                  {emp.email}
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 flex justify-between items-center">
                <div className="flex items-center text-[#5A5A40] font-bold">
                  <DollarSign size={14} className="mr-0.5" />
                  {emp.salary.toLocaleString()}
                </div>
                <div className="text-[10px] text-black/40">
                  Hired: {new Date(emp.hireDate).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Full Name</label>
            <input 
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
              placeholder="e.g., Jane Smith"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Role</label>
              <input 
                type="text"
                required
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
                placeholder="e.g., Quality Manager"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Department</label>
              <input 
                type="text"
                required
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
                className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
                placeholder="e.g., Operations"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Email Address</label>
            <input 
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
              placeholder="e.g., jane@factory.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Monthly Salary</label>
              <input 
                type="number"
                required
                min="0"
                value={form.salary}
                onChange={e => setForm({ ...form, salary: parseInt(e.target.value) })}
                className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Hire Date</label>
              <input 
                type="date"
                required
                value={form.hireDate}
                onChange={e => setForm({ ...form, hireDate: e.target.value })}
                className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-black/40 uppercase tracking-widest">Assigned Factory</label>
            <select 
              required
              value={form.factoryId}
              onChange={e => setForm({ ...form, factoryId: e.target.value })}
              className="w-full p-3 bg-[#F5F5F0] rounded-xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
            >
              <option value="">Select Factory</option>
              {factories.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <button 
            disabled={submitting}
            type="submit"
            className="w-full bg-[#5A5A40] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#4A4A30] disabled:opacity-50 transition-all"
          >
            {submitting ? 'Adding...' : 'Add Employee'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default HR;
