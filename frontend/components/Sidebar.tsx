import React from 'react';
import { View } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { KeywordIcon } from './icons/KeywordIcon';
import { ChatIcon } from './icons/ChatIcon';
import { BellIcon } from './icons/BellIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 transition-colors duration-200 text-left ${
      isActive
        ? 'bg-sky-500 text-white'
        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-4 font-medium">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  return (
    <div className="flex flex-col w-64 bg-slate-800 text-white flex-shrink-0">
      <div className="flex items-center justify-center h-20 border-b border-slate-700">
        <BellIcon className="h-8 w-8 text-sky-400" />
        <h1 className="ml-3 text-2xl font-bold">Tele-AI</h1>
      </div>
      <nav className="flex-1 mt-6">
        <NavItem
          icon={<DashboardIcon className="h-6 w-6" />}
          label="Dashboard"
          isActive={currentView === View.Dashboard}
          onClick={() => setView(View.Dashboard)}
        />
        <NavItem
          icon={<KeywordIcon className="h-6 w-6" />}
          label="Keywords"
          isActive={currentView === View.Keywords}
          onClick={() => setView(View.Keywords)}
        />
        <NavItem
          icon={<ChatIcon className="h-6 w-6" />}
          label="Chats"
          isActive={currentView === View.Chats}
          onClick={() => setView(View.Chats)}
        />
      </nav>
       <div className="p-2 border-t border-slate-700">
        <NavItem
          icon={<SettingsIcon className="h-6 w-6" />}
          label="Settings"
          isActive={currentView === View.Settings}
          onClick={() => setView(View.Settings)}
        />
      </div>
    </div>
  );
};
