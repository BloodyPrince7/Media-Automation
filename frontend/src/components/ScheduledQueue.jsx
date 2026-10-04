import React from 'react';
import { Clock, Send, Trash2, Calendar, Edit3, Image as ImageIcon } from 'lucide-react';
import { publishPostNow, deletePost } from '../api/client';

export default function ScheduledQueue({ posts = [], onRefresh, onEditPost }) {
  const scheduledPosts = posts.filter(p => p.status === 'SCHEDULED' || p.status === 'DRAFT');

  const handlePublishNow = async (id) => {
    try {
      await publishPostNow(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error triggering publish: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to cancel and delete this post?')) return;
    try {
      await deletePost(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error deleting post: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="neo-box p-6 sm:p-7 bg-white">
      <div className="flex items-center justify-between border-b-2 border-[#111116]/10 pb-4 mb-5">
        <div>
          <h2 className="text-2xl font-display font-bold text-[#111116] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff6a91] border-1.5 border-[#111116]" />
            <span>Scheduled & Draft Queue</span>
          </h2>
          <p className="text-xs text-[#111116]/70 mt-0.5 font-medium">
            Upcoming automated broadcasts and saved post drafts
          </p>
        </div>
        <span className="text-xs font-display font-bold bg-[#ffe400] text-[#111116] border-2 border-[#111116] px-3 py-1 rounded-full shadow-[2px_2px_0px_#111116]">
          {scheduledPosts.length} Queued
        </span>
      </div>

      {scheduledPosts.length === 0 ? (
        <div className="py-14 text-center text-[#111116]/60 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#fef7e6] border-2 border-[#111116] flex items-center justify-center mb-1 shadow-[2px_2px_0px_#111116]">
            <Clock className="w-6 h-6 text-[#111116]" />
          </div>
          <p className="text-base font-display font-bold text-[#111116]">No scheduled posts in the queue</p>
          <p className="text-xs text-[#111116]/70 max-w-sm font-medium">
            Compose a post and select "Schedule for later" to automate your publishing cadence across networks.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {scheduledPosts.map((post) => {
            const hasMedia = post.media_urls && post.media_urls.length > 0;
            const scheduledDate = post.scheduled_at ? new Date(post.scheduled_at) : null;

            return (
              <div
                key={post.id}
                className="bg-[#fdfaf3] border-2 border-[#111116] hover:shadow-[4px_4px_0px_#111116] rounded-2xl p-4.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[2px_2px_0px_#111116]"
              >
                <div className="flex-1 min-w-0">
                  {/* Status & Platform Tags */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border-1.5 border-[#111116] ${
                      post.status === 'SCHEDULED'
                        ? 'bg-[#6CEBB0] text-[#111116]'
                        : 'bg-white text-[#111116]'
                    }`}>
                      {post.status}
                    </span>

                    {post.target_platforms?.includes('x') && (
                      <span className="text-[10px] font-bold bg-[#111116] text-white px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        X
                      </span>
                    )}

                    {post.target_platforms?.includes('linkedin') && (
                      <span className="text-[10px] font-bold bg-[#6a6afe] text-white px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                        </svg>
                        LinkedIn
                      </span>
                    )}

                    {(post.target_platforms?.includes('instagram') || post.target_platforms?.includes('ig')) && (
                      <span className="text-[10px] font-bold bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </span>
                    )}

                    {hasMedia && (
                      <span className="text-[10px] font-bold bg-white text-[#111116] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#111116]">
                        <ImageIcon className="w-2.5 h-2.5" />
                        {post.media_urls.length} media
                      </span>
                    )}

                    {scheduledDate && (
                      <span className="text-xs text-[#111116]/80 flex items-center gap-1 ml-auto sm:ml-0 font-mono font-bold">
                        <Clock className="w-3.5 h-3.5 text-[#6a6afe]" />
                        {scheduledDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#111116] line-clamp-2 leading-relaxed font-medium">
                    {post.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {onEditPost && (
                    <button
                      type="button"
                      onClick={() => onEditPost(post)}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-[#fef7e6] border-2 border-[#111116] text-xs font-display font-bold text-[#111116] flex items-center gap-1.5 shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
                      title="Edit in Studio Composer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePublishNow(post.id)}
                    className="px-3.5 py-1.5 rounded-full bg-[#6a6afe] hover:bg-[#5858f5] border-2 border-[#111116] text-xs font-display font-bold text-white flex items-center gap-1.5 shadow-[2px_2px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
                    title="Publish immediately"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 rounded-full bg-white hover:bg-[#ffebee] border-2 border-[#111116] text-[#111116] hover:text-[#b71c1c] shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
                    title="Delete scheduled draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
