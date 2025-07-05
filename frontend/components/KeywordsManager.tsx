import React, { useState } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { api } from '../services/apiService';

interface KeywordsManagerProps {
  keywords: string[];
  backendUrl: string;
}

export const KeywordsManager: React.FC<KeywordsManagerProps> = ({ keywords, backendUrl }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        await api.addKeyword(backendUrl, newKeyword.trim());
        setNewKeyword('');
      } catch (err) {
        setError('Failed to add keyword. Please check the backend connection.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleDelete = async (keyword: string) => {
     try {
        await api.deleteKeyword(backendUrl, keyword);
        setError(null);
      } catch (err) {
        setError('Failed to delete keyword.');
        console.error(err);
      }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Keyword Management</h1>
      <p className="text-slate-400 mb-6">Add or remove keywords to be monitored by the AI assistant.</p>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Enter a new keyword"
          className="flex-grow bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             <>
              <PlusIcon className="h-5 w-5 mr-2" />
              Add
            </>
          )}

        </button>
      </form>

      <div className="bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Active Keywords ({keywords.length})</h2>
        {keywords.length > 0 ? (
          <ul className="space-y-3">
            {[...keywords].sort().map((keyword) => (
              <li
                key={keyword}
                className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg"
              >
                <span className="text-slate-200">{keyword}</span>
                <button
                  onClick={() => handleDelete(keyword)}
                  className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                  aria-label={`Delete keyword ${keyword}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-400 py-4">No keywords have been added yet.</p>
        )}
      </div>
    </div>
  );
};