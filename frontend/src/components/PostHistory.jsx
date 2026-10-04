import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, ExternalLink, RotateCcw, 
  ListFilter, Trash2, MessageCircle, LayoutGrid, List 
} from 'lucide-react';
import { publishPostNow, deletePost } from '../api/client';
import EngagementModal from './EngagementModal';
import SocialPostCard from './SocialPostCard';

export default function PostHistory({ posts = [], onRefresh }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PUBLISHED' | 'FAILED'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'list'
  const [selectedEngagementPost, setSelectedEngagementPost] = useState(null);

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
    <div className="neo-box p-6 sm:p-7 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-[#111116]/10 pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-[#111116] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#6CEBB0] border-1.5 border-[#111116]" />
            <span>Broadcast Feed & Social Cards</span>
          </h2>
          <p className="text-xs text-[#111116]/70 mt-0.5 font-medium">
            Authentic social media cards with real-time reaction counters and in-app thread replying
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Card View vs List View Toggle */}
          <div className="flex items-center gap-1 bg-[#fef7e6] border-2 border-[#111116] p-1 rounded-full text-xs font-display font-bold shadow-[2px_2px_0px_#111116]">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                viewMode === 'cards' 
                  ? 'bg-[#6a6afe] text-white shadow-sm' 
                  : 'text-[#111116] hover:bg-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Social Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                viewMode === 'list' 
                  ? 'bg-[#111116] text-white shadow-sm' 
                  : 'text-[#111116] hover:bg-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Audit List</span>
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#fef7e6] border-2 border-[#111116] p-1 rounded-full text-xs font-display font-bold shadow-[2px_2px_0px_#111116]">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-full transition-all ${
                filter === 'ALL' ? 'bg-[#111116] text-white' : 'text-[#111116] hover:bg-white'
              }`}
            >
              All ({historyPosts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('PUBLISHED')}
              className={`px-3 py-1 rounded-full transition-all ${
                filter === 'PUBLISHED' ? 'bg-[#6CEBB0] text-[#111116]' : 'text-[#111116] hover:bg-white'
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => setFilter('FAILED')}
              className={`px-3 py-1 rounded-full transition-all ${
                filter === 'FAILED' ? 'bg-[#f9665f] text-white' : 'text-[#111116] hover:bg-white'
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center text-[#111116]/60 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-[#fef7e6] border-2 border-[#111116] flex items-center justify-center mb-1 shadow-[2px_2px_0px_#111116]">
            <ListFilter className="w-6 h-6 text-[#111116]" />
          </div>
          <p className="text-base font-display font-bold text-[#111116]">No broadcast records found</p>
          <p className="text-xs text-[#111116]/70 max-w-sm font-medium">
            Posts published to X or LinkedIn appear here as authentic social media cards with live performance metrics.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Actual Social Media Feed Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <SocialPostCard
              key={post.id}
              post={post}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      ) : (
        /* Compact Audit List View */
        <div className="space-y-3.5">
          {filteredPosts.map((post) => {
            const isSuccess = post.status === 'PUBLISHED';
            const isFailed = post.status === 'FAILED';
            const publishedDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);

            return (
              <div
                key={post.id}
                className="bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl p-4.5 transition-all flex flex-col gap-3 shadow-[2px_2px_0px_#111116] hover:shadow-[4px_4px_0px_#111116]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border-1.5 border-[#111116] ${
                        isSuccess
                          ? 'bg-[#6CEBB0] text-[#111116]'
                          : isFailed
                          ? 'bg-[#f9665f] text-white'
                          : 'bg-[#ffe400] text-[#111116]'
                      }`}>
                        {post.status}
                      </span>

                      <span className="text-xs text-[#111116]/60 font-mono font-bold">
                        {publishedDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-[#111116] line-clamp-3 leading-relaxed font-medium">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSuccess && (
                      <button
                        type="button"
                        onClick={() => setSelectedEngagementPost(post)}
                        className="px-3 py-1.5 rounded-full bg-[#ffe400] text-[#111116] border-2 border-[#111116] text-xs font-display font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
                        title="View live metrics and replies"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#111116]" />
                        <span>Stats & Reply</span>
                      </button>
                    )}

                    {!isSuccess && (
                      <button
                        type="button"
                        onClick={() => handleRetry(post.id)}
                        className="px-3 py-1.5 rounded-full bg-white text-[#111116] border-2 border-[#111116] text-xs font-display font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_#111116] hover:bg-[#fef7e6] transition-all cursor-pointer"
                        title="Retry broadcast"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 rounded-full bg-white hover:bg-[#ffebee] border-2 border-[#111116] text-[#111116] hover:text-[#b71c1c] shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Per-platform Delivery Receipts & Links */}
                {post.publish_logs && post.publish_logs.length > 0 && (
                  <div className="bg-white border-2 border-[#111116] rounded-xl p-2.5 space-y-1.5 text-xs font-mono">
                    {post.publish_logs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {log.status === 'SUCCESS' ? (
                            <CheckCircle2 className="w-4 h-4 text-[#2e7d32] shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-[#c62828] shrink-0" />
                          )}
                          <span className="uppercase text-[#111116] font-bold">{log.platform}</span>
                          <span className="text-[#111116]/40">•</span>
                          <span className={log.status === 'SUCCESS' ? 'text-[#2e7d32] font-bold' : 'text-[#c62828] font-bold'}>
                            {log.status}
                          </span>
                          {log.error_message && (
                            <span className="text-[#c62828] truncate max-w-xs font-sans text-[11px] font-medium">
                              ({log.error_message})
                            </span>
                          )}
                        </div>

                        {log.post_url && (
                          <a
                            href={log.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6a6afe] hover:underline font-bold flex items-center gap-1 text-[11px]"
                          >
                            <span>Open URL</span>
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

      {selectedEngagementPost && (
        <EngagementModal
          post={selectedEngagementPost}
          onClose={() => setSelectedEngagementPost(null)}
        />
      )}
    </div>
  );
}
