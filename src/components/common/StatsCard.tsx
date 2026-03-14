import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'emerald' | 'indigo' | 'amber' | 'rose' | 'blue';
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600'
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 flex items-center space-x-4">
      <div className={`p-4 rounded-2xl ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-bold text-black/40 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-serif font-bold text-black">{value}</p>
        {subtitle && <p className="text-xs text-black/40 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
