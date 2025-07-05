import React, { useState } from 'react';
import { View } from '../types';

interface SettingsProps {
  currentUrl: string;
  onSave: (url: string) => void;
  setView: (view: View) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUrl, onSave, setView }) => {
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (trimmedUrl && (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://'))) {
      setError('');
      onSave(trimmedUrl);
    } else {
        setError('Please enter a valid URL, starting with http:// or https://');
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-full">
      <div className="bg-slate-800/50 p-8 rounded-lg shadow-lg w-full text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400 mb-8">
          Configure the connection to your backend server.
        </p>
        
        {!currentUrl && (
            <div className="bg-sky-900/50 border border-sky-700 text-sky-200 px-4 py-3 rounded-lg mb-6 text-left" role="alert">
                <strong className="font-bold">Welcome!</strong>
                <span className="block sm:inline"> To get started, please enter your backend URL below. You can find this URL after deploying your backend on a service like Railway.</span>
            </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label htmlFor="backendUrl" className="block text-left text-slate-300 mb-2 font-medium">
              Backend API URL
            </label>
            <input
              id="backendUrl"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g., https://my-bot.up.railway.app"
              className="w-full bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-describedby="url-error"
            />
             {error && <p id="url-error" className="text-red-400 text-left text-sm mt-2">{error}</p>}
          </div>
          <div className="flex gap-4 mt-4">
             {currentUrl && (
                <button
                type="button"
                onClick={() => setView(View.Dashboard)}
                className="w-full flex items-center justify-center px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              Save and Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
