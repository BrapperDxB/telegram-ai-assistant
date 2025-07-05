import React, { useState } from 'react';
import { Match } from '../types';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { KeywordIcon } from './icons/KeywordIcon';

interface MatchCardProps {
  match: Match;
}

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isReplySent, setIsReplySent] = useState(false);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    // In a real app, this would send the reply via an API call
    console.log(`Replying to ${match.author} in chat ${match.chatName}: ${replyText}`);
    setIsReplySent(true);
    setShowReply(false);
    setReplyText('');
    setTimeout(() => setIsReplySent(false), 3000);
  };

  return (
    <div className="bg-slate-700/60 p-4 rounded-lg shadow-md border border-slate-600/50 hover:border-sky-500/50 transition-all duration-200">
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="font-bold text-sky-400">{match.author}</p>
          <p className="text-sm text-slate-400">in channel: {match.chatName}</p>
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">{new Date(match.timestamp).toLocaleString()}</span>
      </div>
      <p className="my-3 text-slate-200 whitespace-pre-wrap">{match.message}</p>
      
      {showReply && (
        <form onSubmit={handleReplySubmit} className="mt-4 flex gap-2">
            <input 
                type="text" 
                value={replyText} 
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${match.author}... (mock)`}
                className="flex-grow bg-slate-600 text-white placeholder-slate-400 border border-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                autoFocus
            />
            <button type="submit" className="px-4 py-2 text-sm bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700">Send</button>
        </form>
      )}

      {isReplySent && (
          <p className="mt-3 text-sm text-green-400">Reply sent successfully! (mock)</p>
      )}

      <div className="mt-4 pt-3 border-t border-slate-600/50 flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2 text-amber-400" title="Matched Keyword">
            <KeywordIcon className="h-4 w-4"/>
            <span className="font-medium">{match.keyword}</span>
        </div>
        <div className="flex items-center gap-4">
            <button
            onClick={() => setShowReply(!showReply)}
            className="font-medium text-slate-300 hover:text-white"
            >
            {showReply ? 'Cancel' : 'Reply Directly'}
            </button>
            <a
            href={match.chatLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-1.5 bg-slate-600/70 rounded-full hover:bg-slate-600 text-slate-300 hover:text-white ${!match.chatLink ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-disabled={!match.chatLink}
            onClick={(e) => !match.chatLink && e.preventDefault()}
            >
            View Original <ExternalLinkIcon className="h-4 w-4" />
            </a>
        </div>
      </div>
    </div>
  );
};

export { MatchCard };