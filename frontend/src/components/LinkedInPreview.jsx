import React from 'react';
import { ThumbsUp, MessageSquare, Repeat, Send, Globe, Plus } from 'lucide-react';

export default function LinkedInPreview({ text = '', mediaUrls = [] }) {
  const charCount = text ? text.trim().length : 0;
  const isOverLimit = charCount > 3000;

  const renderFormattedText = (content) => {
    if (!content) return <span className="text-neutral-400 italic">Start typing your post to preview it on LinkedIn...</span>;

    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\s+)/).map((word, wIdx) => {
          if (word.startsWith('#')) {
            return <span key={wIdx} className="text-[#70b5f8] font-medium hover:underline cursor-pointer">{word}</span>;
          }
          if (word.startsWith('http://') || word.startsWith('https://')) {
            return <span key={wIdx} className="text-[#70b5f8] hover:underline cursor-pointer">{word}</span>;
          }
          return word;
        })}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full max-w-[540px] mx-auto bg-[#1b1f23] border border-neutral-700/60 rounded-xl text-neutral-200 font-sans shadow-xl overflow-hidden">
      {/* Top Banner / Simulator Label */}
      <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
        <span className="flex items-center gap-1.5 font-semibold text-[#0a66c2]">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
          </svg>
          LinkedIn Feed Simulator
        </span>
        <span className={`px-2 py-0.5 rounded-full ${
          isOverLimit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-neutral-800 text-neutral-400'
        }`}>
          {charCount}/3,000
        </span>
      </div>

      <div className="p-4">
        {/* Author Header */}
        <div className="flex items-start justify-between">
          <div className="flex gap-2.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-base shadow">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-[15px] hover:text-[#70b5f8] cursor-pointer">Pankaj</span>
                <span className="text-xs text-neutral-400">• 1st</span>
              </div>
              <p className="text-xs text-neutral-400 line-clamp-1">Building Automation & Software Systems</p>
              <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5">
                <span>Just now</span>
                <span>•</span>
                <Globe className="w-3 h-3 text-neutral-400" />
              </div>
            </div>
          </div>

          <button className="text-[#70b5f8] hover:bg-[#70b5f8]/10 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Follow
          </button>
        </div>

        {/* Post Text */}
        <div className="mt-3 text-[14px] leading-relaxed text-neutral-100 whitespace-pre-wrap">
          {renderFormattedText(text)}
        </div>

        {/* Media */}
        {mediaUrls && mediaUrls.length > 0 && (
          <div className="mt-3 rounded-lg overflow-hidden border border-neutral-700/80">
            {mediaUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="Post Media"
                className="w-full max-h-96 object-cover"
              />
            ))}
          </div>
        )}

        {/* Reaction Counts */}
        <div className="flex items-center justify-between text-xs text-neutral-400 mt-3 pt-2 border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-1">
            <span className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white">👍</span>
              <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[9px] text-white">💡</span>
              <span className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[9px] text-white">❤️</span>
            </span>
            <span className="ml-1 hover:underline cursor-pointer">42</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hover:underline cursor-pointer">8 comments</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">2 reposts</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-4 gap-1 pt-1 text-neutral-300 text-xs font-semibold">
          <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-neutral-800 rounded transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span>Like</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-neutral-800 rounded transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-neutral-800 rounded transition-colors">
            <Repeat className="w-4 h-4" />
            <span>Repost</span>
          </button>
          <button className="flex items-center justify-center gap-1.5 py-2 hover:bg-neutral-800 rounded transition-colors">
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
