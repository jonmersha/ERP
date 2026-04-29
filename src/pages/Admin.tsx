import React from 'react';
import { Shield, Users, Database, Server, DatabaseZap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';

const Admin: React.FC = () => {
  const [backendMode, setBackendMode] = React.useState<'firebase' | 'sql'>(apiService.getMode());
  const [isLoading, setIsLoading] = React.useState(false);

  const switchBackend = async (mode: 'firebase' | 'sql') => {
    setIsLoading(true);
    try {
      const resp = await fetch('/api/settings/backend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      if (resp.ok) {
        apiService.setMode(mode);
        setBackendMode(mode);
        // Refresh page to apply changes throughout the app
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const adminTasks = [
    { name: 'HR Management', path: '/hr', icon: Users, description: 'Manage employee records and payroll' },
    { name: 'User Management', path: '/users', icon: Shield, description: 'Manage user access and roles' },
    { name: 'Master Data', path: '/master-data', icon: Database, description: 'Manage structural entities' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[var(--color-main)]">Admin Panel</h2>
          <p className="text-[var(--color-text)]/40 mt-1">Manage core application operations and settings</p>
        </div>
        
        <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm font-medium">
             <Server size={18} className="text-[var(--color-main)]" />
             <span>Active Storage:</span>
             <span className="font-bold uppercase text-[var(--color-main)]">{backendMode}</span>
          </div>
        </div>
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

        {/* Database Switcher Card */}
        <div className="bg-[var(--color-surface)] p-6 rounded-3xl border-2 border-dashed border-[var(--color-main)]/30 flex flex-col justify-between">
           <div>
              <div className="w-12 h-12 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-2xl flex items-center justify-center mb-4">
                <DatabaseZap size={24} />
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--color-text)]">Storage Infrastructure</h3>
              <p className="text-sm text-[var(--color-text)]/60 mt-1">Detach storage from Firebase and switch to SQL.</p>
           </div>
           
           <div className="mt-6 flex space-x-2">
              <button 
                onClick={() => switchBackend('firebase')}
                disabled={isLoading || backendMode === 'firebase'}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  backendMode === 'firebase' 
                  ? 'bg-[var(--color-main)] text-white' 
                  : 'bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-main)]/10'
                }`}
              >
                Firebase (NoSQL)
              </button>
              <button 
                onClick={() => switchBackend('sql')}
                disabled={isLoading || backendMode === 'sql'}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  backendMode === 'sql' 
                  ? 'bg-[var(--color-main)] text-white' 
                  : 'bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-main)]/10'
                }`}
              >
                SQL (Mocked)
              </button>
           </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
         <h3 className="text-xl font-serif font-bold text-[var(--color-text)] mb-6">System Architecture Architecture</h3>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] text-center">
               <div className="font-bold text-[var(--color-main)] mb-1">Frontend</div>
               <div className="text-xs">React SPA (Vite)</div>
            </div>
            <div className="flex items-center justify-center">
               <div className="h-0.5 w-full bg-[var(--color-border)] relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--color-border)] rotate-45 border-t border-r"></div>
               </div>
            </div>
            <div className="p-4 bg-[var(--color-bg)] rounded-2xl border border-[var(--color-border)] text-center">
               <div className="font-bold text-[var(--color-main)] mb-1">Decoupler</div>
               <div className="text-xs">Express API Proxy</div>
            </div>
            <div className="flex items-center justify-center">
               <div className="h-0.5 w-full bg-[var(--color-border)] relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[var(--color-border)] rotate-45 border-t border-r"></div>
               </div>
            </div>
            <div className="p-4 bg-[var(--color-main)] text-white rounded-2xl border border-[var(--color-main)] text-center">
               <div className="font-bold mb-1">Data Layer</div>
               <div className="text-xs uppercase font-mono">{backendMode} Adapter</div>
            </div>
         </div>
         <p className="mt-6 text-xs text-[var(--color-text)]/40 leading-relaxed italic">
            This architecture allows the system to remain database-agnostic. The frontend always talks to the "Decoupler" API. 
            The adapter handles the specific dialect (NoSQL or SQL) based on your selection.
         </p>
      </div>
    </div>
  );
};

export default Admin;
