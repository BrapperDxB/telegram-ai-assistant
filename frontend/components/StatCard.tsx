import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => {
  return (
    <div className="bg-slate-800/50 p-5 rounded-lg shadow-lg flex items-center space-x-4">
      <div className="bg-slate-700/50 p-3 rounded-full text-sky-400">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};