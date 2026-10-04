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
    <div className="bg-[#12141c] border border-neutral-800 rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Scheduled & Draft Queue</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Upcoming automated broadcasts and saved drafts
          </p>
        </div>
        <span className="text-xs font-mono bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-full text-neutral-300">
          {scheduledPosts.length} Queued
        </span>
      </div>

      {scheduledPosts.length === 0 ? (
        <div className="py-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
          <Clock className="w-8 h-8 stroke-1 text-neutral-600" />
          <p className="text-sm font-medium text-neutral-400">No scheduled posts in the queue</p>
          <p className="text-xs text-neutral-500">
            Compose a post and select "Schedule for later" to automate your publishing cadence.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduledPosts.map((post) => {
            const hasMedia = post.media_urls && post.media_urls.length > 0;
            const scheduledDate = post.scheduled_at ? new Date(post.scheduled_at) : null;

            return (
              <div
                key={post.id}
                className="bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700/80 rounded-xl p-4 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  {/* Status & Platform Tags */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                      post.status === 'SCHEDULED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {post.status}
                    </span>

                    {post.target_platforms?.includes('x') && (
                      <span className="text-[10px] bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        X
                      </span>
                    )}

                    {post.target_platforms?.includes('linkedin') && (
                      <span className="text-[10px] bg-[#0a66c2]/10 text-[#70b5f8] px-2 py-0.5 rounded border border-[#0a66c2]/30 flex items-center gap-1">
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                        </svg>
                        LinkedIn
                      </span>
                    )}

                    {hasMedia && (
                      <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded flex items-center gap-1 border border-neutral-800">
                        <ImageIcon className="w-2.5 h-2.5" />
                        {post.media_urls.length} media
                      </span>
                    )}

                    {scheduledDate && (
                      <span className="text-xs text-neutral-400 flex items-center gap-1 ml-auto sm:ml-0 font-mono">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {scheduledDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Content Preview */}
                  <p className="text-xs text-neutral-200 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePublishNow(post.id)}
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 hover:text-white transition-colors"
                    title="Publish immediately"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  {onEditPost && (
                    <button
                      type="button"
                      onClick={() => onEditPost(post)}
                      className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 hover:text-white transition-colors"
                      title="Edit in composer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 transition-colors"
                    title="Delete post"
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
