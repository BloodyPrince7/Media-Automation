import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function InstagramPreview({ text = '', mediaUrls = [] }) {
  const charCount = text ? text.trim().length : 0;
  const isOverLimit = charCount > 2200;
  const hasMedia = mediaUrls && mediaUrls.length > 0;

  // Format hashtags and mentions
  const renderFormattedCaption = (content) => {
    if (!content) {
      return (
        <span className="text-neutral-400 italic">
          Write an engaging story or hook to preview your Instagram caption...
        </span>
      );
    }

    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\s+)/).map((word, wIdx) => {
          if (word.startsWith('#') || word.startsWith('@')) {
            return (
              <span key={wIdx} className="text-[#00376b] dark:text-[#3897f0] font-medium hover:underline cursor-pointer">
                {word}
              </span>
            );
          }
          if (word.startsWith('http://') || word.startsWith('https://')) {
            return (
              <span key={wIdx} className="text-[#00376b] dark:text-[#3897f0] hover:underline cursor-pointer">
                {word}
              </span>
            );
          }
          return word;
        })}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="w-full max-w-[540px] mx-auto bg-white border-2 border-[#111116] rounded-2xl overflow-hidden shadow-xl text-[#111116] font-sans">
      
      {/* Top Meta info bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#fef7e6] border-b-2 border-[#111116]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white">
            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <span className="text-xs font-display font-bold text-[#111116] uppercase tracking-wider">
            Instagram Feed Simulator
          </span>
        </div>
        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#111116] ${
          isOverLimit ? 'bg-[#ffebee] text-[#b71c1c]' : 'bg-white text-[#111116]'
        }`}>
          {charCount}/2200
        </span>
      </div>

      {/* Header Profile Row */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          {/* Gradient Story Ring */}
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
            <div className="p-[1.5px] bg-white rounded-full">
              <div className="w-8 h-8 rounded-full bg-[#111116] text-white flex items-center justify-center font-display font-bold text-xs">
                P
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-xs text-[#111116]">creator_studio</span>
              <span className="w-1 h-1 rounded-full bg-neutral-300" />
              <button type="button" className="text-xs font-semibold text-[#0095f6] hover:text-[#00376b]">
                Follow
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 font-medium">Original Audio</p>
          </div>
        </div>

        <button type="button" className="p-1 text-neutral-600 hover:text-black">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Media Display Area */}
      {hasMedia ? (
        <div className="relative aspect-square sm:aspect-[4/3] bg-neutral-900 w-full overflow-hidden flex items-center justify-center">
          <img
            src={mediaUrls[0]}
            alt="Instagram visual"
            className="w-full h-full object-cover"
          />
          {mediaUrls.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[11px] font-mono px-2 py-0.5 rounded-full font-bold">
              1/{mediaUrls.length}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-square sm:aspect-[4/3] bg-[#fcf8ef] border-y border-dashed border-[#111116]/20 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#111116] flex items-center justify-center mb-3 shadow-[2px_2px_0px_#111116]">
            <ImageIcon className="w-6 h-6 text-[#ff6a91]" />
          </div>
          <p className="text-xs font-display font-bold text-[#111116] max-w-xs">
            Visual Media Attachment Required
          </p>
          <p className="text-[11px] text-[#111116]/60 mt-1 max-w-xs leading-relaxed">
            Instagram posts require at least one photo or video. Upload an asset in the media drawer above to preview the feed card.
          </p>
        </div>
      )}

      {/* Interactive Action Bar */}
      <div className="px-3.5 pt-3 pb-1">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-4">
            <button type="button" className="hover:opacity-60 transition-opacity">
              <Heart className="w-5 h-5 text-[#111116]" />
            </button>
            <button type="button" className="hover:opacity-60 transition-opacity">
              <MessageCircle className="w-5 h-5 text-[#111116] -rotate-90" />
            </button>
            <button type="button" className="hover:opacity-60 transition-opacity">
              <Send className="w-5 h-5 text-[#111116]" />
            </button>
          </div>
          <button type="button" className="hover:opacity-60 transition-opacity">
            <Bookmark className="w-5 h-5 text-[#111116]" />
          </button>
        </div>

        {/* Likes Count */}
        <div className="text-xs font-display font-bold text-[#111116] mb-1.5">
          48 likes
        </div>

        {/* Caption & Hashtags */}
        <div className="text-xs leading-relaxed break-words text-[#111116] mb-1.5">
          <span className="font-display font-bold mr-1.5">creator_studio</span>
          {renderFormattedCaption(text)}
        </div>

        {/* Comments link & Timestamp */}
        <button type="button" className="text-[11px] text-neutral-400 font-medium hover:underline block mb-1">
          View all comments
        </button>
        <div className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 pb-2">
          JUST NOW
        </div>
      </div>
    </div>
  );
}
