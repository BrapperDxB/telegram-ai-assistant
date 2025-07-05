import React from 'react';
import { Match, Stats, ConnectionStatus } from '../types';
import { MatchCard } from './MatchCard';
import { StatCard } from './StatCard';
import { KeywordIcon } from './icons/KeywordIcon';
import { ChatIcon } from './icons/ChatIcon';
import { BellIcon } from './icons/BellIcon';

interface DashboardProps {
  matches: Match[];
  stats: Stats;
  connectionStatus: ConnectionStatus;
}

const StatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
    const statusConfig = {
        connecting: { text: 'Connecting...', color: 'text-yellow-400', animate: true },
        open: { text: 'Connected (Live)', color: 'text-green-400', animate: false },
        closing: { text: 'Closing...', color: 'text-yellow-400', animate: true },
        closed: { text: 'Disconnected. Retrying...', color: 'text-red-500', animate: true },
        uninstantiated: { text: 'Not Configured', color: 'text-slate-500', animate: false },
    };

    const config = statusConfig[status];

    return (
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-lg">
            <span className={`h-3 w-3 rounded-full relative flex ${config.color.replace('text', 'bg')}`}>
                {config.animate && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-inherit"></span>}
            </span>
            <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ matches, stats, connectionStatus }) => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">Live feed of keyword matches from your selected channels.</p>
        </div>
        <StatusIndicator status={connectionStatus} />
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<KeywordIcon className="h-8 w-8" />} title="Active Keywords" value={stats.keywords} />
        <StatCard icon={<ChatIcon className="h-8 w-8" />} title="Monitored Chats" value={stats.chats} />
        <StatCard icon={<BellIcon className="h-8 w-8" />} title="Total Matches Found" value={stats.matches} />
      </div>

      <div className="bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-lg flex-grow flex flex-col min-h-0">
        <h2 className="text-xl font-semibold text-white mb-4 flex-shrink-0">Incoming Matches</h2>
        <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
          {matches.length > 0 ? (
            matches.map((match) => <MatchCard key={`${match.id}-${match.chatName}`} match={match} />)
          ) : (
            <div className="text-center flex items-center justify-center h-full">
              <p className="text-slate-400">
                {connectionStatus === 'open' ? 'Waiting for new messages...' : 'Connection to backend is not active. Check Settings.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
