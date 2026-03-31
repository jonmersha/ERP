import React from 'react';
import { Shield, Users, Database, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin: React.FC = () => {
  const adminTasks = [
    { name: 'HR Management', path: '/hr', icon: Users, description: 'Manage employee records and payroll' },
    { name: 'User Management', path: '/users', icon: Shield, description: 'Manage user access and roles' },
    { name: 'Master Data', path: '/master-data', icon: Database, description: 'Manage structural entities' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-serif font-bold text-[var(--color-main)]">Admin Panel</h2>
        <p className="text-[var(--color-text)]/40 mt-1">Manage core application operations and settings</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminTasks.map((task) => (
          <Link
            key={task.name}
            to={task.path}
            className="bg-[var(--color-surface)] p-6 rounded-3xl border border-[var(--color-text)]/5 hover:border-[var(--color-main)]/50 transition-all group"
          >
            <div className="w-12 h-12 bg-[var(--color-main)]/10 text-[var(--color-main)] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <task.icon size={24} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[var(--color-text)]">{task.name}</h3>
            <p className="text-sm text-[var(--color-text)]/60 mt-1">{task.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Admin;
