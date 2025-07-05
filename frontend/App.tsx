import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { KeywordsManager } from './components/KeywordsManager';
import { ChatsManager } from './components/ChatsManager';
import { Settings } from './components/Settings';
import { View, Match } from './types';
import { useWebSocket } from './hooks/useWebSocket';
import { api } from './services/apiService';

const App: React.FC = () => {
  const [view, setView] = useState<View>(() => {
      // Start on settings page if no URL is saved
      return localStorage.getItem('backendUrl') ? View.Dashboard : View.Settings;
  });
  const [backendUrl, setBackendUrl] = useState<string>(() => localStorage.getItem('backendUrl') || '');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [chats, setChats] = useState<number[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const wsUrl = backendUrl ? `${backendUrl.replace(/^http/, 'ws')}/ws` : null;
  const { connectionStatus, lastMessage } = useWebSocket(wsUrl);

  const fetchInitialData = useCallback(async () => {
    if (!backendUrl) return;
    try {
      const keywordsData = await api.getKeywords(backendUrl);
      setKeywords(keywordsData);

      const chatsData = await api.getChats(backendUrl);
      setChats(chatsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      // If fetching fails, maybe the URL is bad, prompt user to check settings
      setView(View.Settings);
    }
  }, [backendUrl]);

  useEffect(() => {
    if (backendUrl) {
        fetchInitialData();
    }
  }, [backendUrl, fetchInitialData]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const event = JSON.parse(lastMessage);
        if (event.type === 'new_match' && event.data) {
          setMatches(prevMatches => [event.data, ...prevMatches].slice(0, 100)); // Keep last 100 matches
        }
        if (event.type === 'keywords' && Array.isArray(event.data)) {
          setKeywords(event.data);
        }
         if (event.type === 'chats' && Array.isArray(event.data)) {
          setChats(event.data);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    }
  }, [lastMessage]);
  
  const handleSaveSettings = (url: string) => {
    const formattedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    localStorage.setItem('backendUrl', formattedUrl);
    setBackendUrl(formattedUrl);
    setView(View.Dashboard);
    // Reset state when URL changes to avoid showing stale data
    setKeywords([]);
    setChats([]);
    setMatches([]);
  };

  const renderContent = () => {
    if (!backendUrl || view === View.Settings) {
      return <Settings currentUrl={backendUrl} onSave={handleSaveSettings} setView={setView} />;
    }
    
    switch (view) {
      case View.Keywords:
        return <KeywordsManager keywords={keywords} backendUrl={backendUrl} />;
      case View.Chats:
        return <ChatsManager chats={chats} backendUrl={backendUrl} />;
      case View.Dashboard:
      default:
        return (
          <Dashboard
            matches={matches}
            stats={{
              keywords: keywords.length,
              chats: chats.length,
              matches: matches.length,
            }}
            connectionStatus={connectionStatus}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar currentView={view} setView={setView} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-900 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;