import React from 'react';
import { MessageCircle, Repeat2, Heart, BarChart2, Bookmark, Share, CheckCircle2 } from 'lucide-react';

export default function XPreview({ text = '', mediaUrls = [], charValidation = null }) {
  const charCount = text ? text.trim().length : 0;
  const isOverLimit = charCount > 280;

  // Format hashtags and mentions
  const renderFormattedText = (content) => {
    if (!content) return <span className="text-neutral-500 italic">Start typing your post to preview it on X...</span>;
    
    // Split lines preserving breaks
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\s+)/).map((word, wIdx) => {
          if (word.startsWith('#') || word.startsWith('@')) {
            return <span key={wIdx} className="text-[#1d9bf0] hover:underline cursor-pointer">{word}</span>;
          }
          if (word.startsWith('http://') || word.startsWith('https://')) {
            return <span key={wIdx} className="text-[#1d9bf0] hover:underline cursor-pointer">{word}</span>;
          }
          return word;
        })}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full max-w-[540px] mx-auto bg-black border border-neutral-800 rounded-2xl p-4 text-white font-sans shadow-xl">
      {/* Top Meta info */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X (Twitter) Feed Simulator
        </span>
        {charValidation && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            isOverLimit 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
              : 'bg-neutral-800 text-neutral-400'
          }`}>
            {charCount}/280
          </span>
        )}
      </div>

      <div className="flex gap-3 pt-1">
        {/* Profile Avatar */}
        <div className="shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-inner">
            P
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-[15px] hover:underline cursor-pointer">Pankaj</span>
              <CheckCircle2 className="w-4 h-4 fill-[#1d9bf0] text-black" />
              <span className="text-neutral-500 text-[14px]">@pankaj_dev</span>
              <span className="text-neutral-500 text-[14px]">·</span>
              <span className="text-neutral-500 text-[14px] hover:underline cursor-pointer">Just now</span>
            </div>
            <button className="text-neutral-500 hover:text-neutral-300">
              <span className="text-lg leading-none">···</span>
            </button>
          </div>

          {/* Tweet Text */}
          <div className="mt-1 text-[15px] leading-relaxed break-words text-neutral-100">
            {renderFormattedText(text)}
          </div>

          {/* Attached Media */}
          {mediaUrls && mediaUrls.length > 0 && (
            <div className={`mt-3 rounded-2xl overflow-hidden border border-neutral-800 grid gap-1 ${
              mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {mediaUrls.map((url, idx) => (
                <div key={idx} className="relative aspect-video bg-neutral-900 overflow-hidden">
                  <img
                    src={url}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Engagement Metrics Row */}
          <div className="flex items-center justify-between text-neutral-500 mt-3 pt-1 border-t border-neutral-900 text-xs">
            <button className="flex items-center gap-2 hover:text-[#1d9bf0] transition-colors group">
              <MessageCircle className="w-4 h-4 group-hover:bg-[#1d9bf0]/10 rounded-full" />
              <span>12</span>
            </button>
            <button className="flex items-center gap-2 hover:text-emerald-500 transition-colors group">
              <Repeat2 className="w-4 h-4 group-hover:bg-emerald-500/10 rounded-full" />
              <span>4</span>
            </button>
            <button className="flex items-center gap-2 hover:text-rose-500 transition-colors group">
              <Heart className="w-4 h-4 group-hover:bg-rose-500/10 rounded-full" />
              <span>48</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#1d9bf0] transition-colors group">
              <BarChart2 className="w-4 h-4 group-hover:bg-[#1d9bf0]/10 rounded-full" />
              <span>1.2K</span>
            </button>
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 hover:text-[#1d9bf0] cursor-pointer" />
              <Share className="w-4 h-4 hover:text-[#1d9bf0] cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
