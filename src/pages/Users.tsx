import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, where, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, UserRole, Company } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { motion } from 'motion/react';
import { Users as UsersIcon, Shield, Mail, Search, Loader2, CheckCircle, XCircle, Building2, Copy } from 'lucide-react';
import Modal from '../components/Modal';

const Users: React.FC = () => {
  const { isAdmin, profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableRoles: UserRole[] = ['admin', 'finance', 'store', 'procurement', 'sales', 'factory_manager'];

  useEffect(() => {
    if (!profile?.companyId) return;

    const fetchData = async () => {
      try {
        const companyId = profile.companyId;
        const [usersRes, companyRes] = await Promise.all([
          fetch(`/api/users?companyId=${companyId}`),
          fetch(`/api/users/company/${companyId}`)
        ]);

        const [usersData, companyData] = await Promise.all([
          usersRes.json(),
          companyRes.json()
        ]);

        if (Array.isArray(usersData)) setUsers(usersData);
        if (companyData && !companyData.error) setCompany(companyData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [profile?.companyId]);

  const handleUpdateRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.uid}/roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roles: selectedUser.roles })
      });
      
      if (!response.ok) throw new Error('Failed to update roles');
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating roles:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRole = (role: UserRole) => {
    if (!selectedUser) return;
    const currentRoles = selectedUser.roles || [];
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    setSelectedUser({ ...selectedUser, roles: newRoles });
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(search.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-black/40">
        <Shield size={48} className="mb-4" />
        <p className="text-xl font-serif">Access Denied</p>
        <p className="text-sm">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[var(--color-main)]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[var(--color-main)]">User Management</h2>
          <p className="text-[var(--color-text)]/40 mt-1">Manage system access and role assignments</p>
        </div>
        {company && (
          <div className="bg-[var(--color-surface)] px-6 py-3 rounded-2xl border border-[var(--color-text)]/5 shadow-sm flex items-center space-x-4">
            <div className="p-2 bg-[var(--color-main)]/10 text-[var(--color-main)] rounded-xl">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--color-text)]/20 uppercase tracking-widest">Join Code</p>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-lg text-[var(--color-main)] tracking-widest">{company.code}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(company.code);
                    alert('Join code copied to clipboard!');
                  }}
                  className="p-1 text-[var(--color-text)]/20 hover:text-[var(--color-main)] transition-colors"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="bg-[var(--color-surface)] rounded-3xl shadow-sm border border-[var(--color-text)]/5 overflow-hidden">
        <div className="p-6 border-b border-[var(--color-text)]/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-serif font-bold text-lg text-[var(--color-text)]">System Users</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/20" size={18} />
            <input 
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg)] rounded-xl border border-[var(--color-text)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--color-main)]/20 text-sm text-[var(--color-text)]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg)]/50 text-[10px] font-bold text-[var(--color-text)]/40 uppercase tracking-widest">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-text)]/5 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-[var(--color-text)]/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-main)]/10 flex items-center justify-center text-[var(--color-main)] font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-text)]">{user.name}</p>
                        <p className="text-xs text-[var(--color-text)]/40 flex items-center">
                          <Mail size={10} className="mr-1" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles?.map(role => (
                        <span key={role} className="px-2 py-1 bg-[var(--color-main)]/10 text-[var(--color-main)] text-[10px] font-bold uppercase rounded-md">
                          {role.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedUser({
                          ...user,
                          roles: user.roles || []
                        });
                        setIsModalOpen(true);
                      }}
                      className="text-[var(--color-main)] font-bold hover:underline"
                    >
                      Manage Roles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Manage User Roles"
      >
        {selectedUser && (
          <form onSubmit={handleUpdateRoles} className="space-y-6">
            <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-text)]/5">
              <p className="text-sm font-bold text-[var(--color-text)]">{selectedUser.name}</p>
              <p className="text-xs text-[var(--color-text)]/40">{selectedUser.email}</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-[var(--color-text)]/40 uppercase tracking-widest">Assign Roles</label>
              <div className="grid grid-cols-2 gap-3">
                {availableRoles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      (selectedUser.roles || []).includes(role)
                        ? 'bg-[var(--color-main)] text-white border-[var(--color-main)]'
                        : 'bg-[var(--color-surface)] text-[var(--color-text)]/60 border-[var(--color-text)]/5 hover:border-[var(--color-main)]/20'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider">{role.replace('_', ' ')}</span>
                    {(selectedUser.roles || []).includes(role) ? <CheckCircle size={16} /> : <XCircle size={16} className="opacity-20" />}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={submitting}
              type="submit"
              className="w-full bg-[var(--color-main)] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[var(--color-main)]/90 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Users;
