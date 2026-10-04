import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ExternalLink, RotateCcw, ListFilter, Trash2 } from 'lucide-react';
import { publishPostNow, deletePost } from '../api/client';

export default function PostHistory({ posts = [], onRefresh }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'FAILED'

  const historyPosts = posts.filter(p => p.status === 'PUBLISHED' || p.status === 'FAILED' || p.status === 'PARTIALLY_PUBLISHED');

  const filteredPosts = historyPosts.filter(p => {
    if (filter === 'PUBLISHED') return p.status === 'PUBLISHED';
    if (filter === 'FAILED') return p.status === 'FAILED' || p.status === 'PARTIALLY_PUBLISHED';
    return true;
  });

  const handleRetry = async (id) => {
    try {
      await publishPostNow(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Retry error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this history record?')) return;
    try {
      await deletePost(id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Delete error: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="bg-[#12141c] border border-neutral-800 rounded-2xl p-5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800/80 pb-4 mb-4 gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>Broadcast History & Audit Log</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Audit trail of completed and attempted distributions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filter === 'ALL' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All ({historyPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PUBLISHED')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filter === 'PUBLISHED' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => setFilter('FAILED')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              filter === 'FAILED' ? 'bg-neutral-800 text-rose-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Failed
          </button>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
          <ListFilter className="w-8 h-8 stroke-1 text-neutral-600" />
          <p className="text-sm font-medium text-neutral-400">No broadcast records found</p>
          <p className="text-xs text-neutral-500">
            Posts published to X or LinkedIn will appear here along with external links and delivery receipts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isSuccess = post.status === 'PUBLISHED';
            const isFailed = post.status === 'FAILED';
            const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);

            return (
              <div
                key={post.id}
                className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 transition-all flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                        isSuccess
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isFailed
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {post.status}
                      </span>

                      <span className="text-xs text-neutral-400 font-mono">
                        {publishedDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-200 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isSuccess && (
                      <button
                        type="button"
                        onClick={() => handleRetry(post.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors"
                        title="Retry broadcast"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-900/50 text-neutral-400 hover:text-rose-400 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Per-platform Delivery Receipts & Links */}
                {post.publish_logs && post.publish_logs.length > 0 && (
                  <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-lg p-2.5 space-y-1.5 text-xs font-mono">
                    {post.publish_logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {log.status === 'SUCCESS' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span className="uppercase text-neutral-300 font-semibold">{log.platform}</span>
                          <span className="text-neutral-500">•</span>
                          <span className={log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>
                            {log.status}
                          </span>
                          {log.error_message && (
                            <span className="text-rose-400/80 truncate max-w-xs font-sans text-[11px]">
                              ({log.error_message})
                            </span>
                          )}
                        </div>

                        {log.post_url && (
                          <a
                            href={log.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1d9bf0] hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <span>Open Post</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
