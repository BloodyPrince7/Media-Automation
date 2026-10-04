import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, Heart, Repeat2, Eye, ExternalLink, 
  Sparkles, Send, CheckCircle2, RotateCcw, Trash2, Globe, Check 
} from 'lucide-react';
import { getPostEngagement, postComment, aiSuggestReply, publishPostNow, deletePost } from '../api/client';

export default function SocialPostCard({ post, onRefresh }) {
  const [activePlatform, setActivePlatform] = useState('x');
  const [metrics, setMetrics] = useState({ likes: 0, replies: 0, reposts: 0, impressions: 0 });
  const [comments, setComments] = useState([]);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const publishedLogs = post?.publish_logs?.filter(l => l.status === 'SUCCESS') || [];
  const hasX = publishedLogs.some(l => l.platform === 'x');
  const hasLinkedIn = publishedLogs.some(l => l.platform === 'linkedin');
  const hasInstagram = publishedLogs.some(l => l.platform === 'instagram' || l.platform === 'ig');
  const xLog = publishedLogs.find(l => l.platform === 'x');
  const linkedInLog = publishedLogs.find(l => l.platform === 'linkedin');
  const igLog = publishedLogs.find(l => l.platform === 'instagram' || l.platform === 'ig');

  useEffect(() => {
    if (hasX) {
      setActivePlatform('x');
    } else if (hasLinkedIn) {
      setActivePlatform('linkedin');
    } else if (hasInstagram) {
      setActivePlatform('instagram');
    }
    fetchMetrics();
  }, [post?.id]);

  const fetchMetrics = async () => {
    if (!post?.id || post.status !== 'PUBLISHED') return;
    setLoadingMetrics(true);
    try {
      const data = await getPostEngagement(post.id);
      const m = data?.metrics?.find(item => item.platform === activePlatform || (activePlatform === 'instagram' && item.platform === 'ig')) || data?.metrics?.[0];
      if (m) {
        setMetrics({
          likes: m.likes || 0,
          replies: m.replies || 0,
          reposts: m.reposts || 0,
          impressions: m.impressions || 0
        });
      }
      setComments(data?.comments || []);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleSuggestAIReply = async () => {
    setLoadingAI(true);
    setStatusMessage(null);
    try {
      let currentText = post.content;
      if (activePlatform === 'x') currentText = post.x_content || post.content;
      else if (activePlatform === 'linkedin') currentText = post.linkedin_content || post.content;
      else if (activePlatform === 'instagram') currentText = post.instagram_content || post.content;
        
      const res = await aiSuggestReply({
        post_content: currentText,
        comment_text: replyText.trim() || 'Great post! Thanks for sharing this.',
        tone: 'engaging'
      });
      setAiSuggestions(res.suggestions || []);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to generate AI suggestions.' });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    setStatusMessage(null);

    try {
      await postComment(post.id, {
        platform: activePlatform,
        content: replyText.trim()
      });
      setReplyText('');
      setAiSuggestions([]);
      setStatusMessage({ 
        type: 'success', 
        text: `Reply dispatched to ${activePlatform.toUpperCase()} thread!` 
      });
      await fetchMetrics();
    } catch (err) {
      console.error('Reply submit error:', err);
      setStatusMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to dispatch reply.' 
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post from history?')) return;
    try {
      await deletePost(post.id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Delete error: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleRetry = async () => {
    try {
      await publishPostNow(post.id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Retry error: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Helper to format text with colored hashtags and links
  const renderFormattedText = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\s+)/).map((word, wIdx) => {
          if (word.startsWith('#') || word.startsWith('@')) {
            return (
              <span key={wIdx} className={activePlatform === 'x' ? 'text-[#1d9bf0] font-medium' : 'text-[#70b5f8] font-medium'}>
                {word}
              </span>
            );
          }
          if (word.startsWith('http://') || word.startsWith('https://')) {
            return (
              <a key={wIdx} href={word} target="_blank" rel="noreferrer" className="text-[#1d9bf0] hover:underline">
                {word}
              </a>
            );
          }
          return word;
        })}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const isX = activePlatform === 'x';
  const isLinkedIn = activePlatform === 'linkedin';
  const isInstagram = activePlatform === 'instagram' || activePlatform === 'ig';
  const effectiveText = isX 
    ? (post.x_content || post.content) 
    : isLinkedIn
    ? (post.linkedin_content || post.content)
    : (post.instagram_content || post.content);

  const activeLog = isX ? xLog : isLinkedIn ? linkedInLog : igLog;
  const isSuccess = post.status === 'PUBLISHED';
  const postDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);
  const totalPlatformsCount = [hasX, hasLinkedIn, hasInstagram].filter(Boolean).length;

  return (
    <div className={`transition-all duration-200 rounded-[26px] shadow-[4px_4px_0px_#111116] hover:shadow-[6px_6px_0px_#111116] overflow-hidden border-2 border-[#111116] ${
      isX 
        ? 'bg-[#000000] text-white' 
        : isLinkedIn
        ? 'bg-[#1b1f23] text-neutral-100'
        : 'bg-[#181419] text-neutral-100'
    }`}>
      
      {/* Top Platform Switcher Header */}
      <div className="px-4 py-2.5 bg-black/60 border-b-2 border-[#111116] flex items-center justify-between text-xs font-display">
        <div className="flex items-center gap-2">
          {totalPlatformsCount > 1 ? (
            <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-xl">
              {hasX && (
                <button
                  type="button"
                  onClick={() => setActivePlatform('x')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                    isX ? 'bg-black text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X Post</span>
                </button>
              )}
              {hasLinkedIn && (
                <button
                  type="button"
                  onClick={() => setActivePlatform('linkedin')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                    isLinkedIn ? 'bg-[#0a66c2] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span>LinkedIn Post</span>
                </button>
              )}
              {hasInstagram && (
                <button
                  type="button"
                  onClick={() => setActivePlatform('instagram')}
                  className={`px-2.5 py-0.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                    isInstagram ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
              {isX ? (
                <>
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span>X (Twitter) Feed</span>
                </>
              ) : isLinkedIn ? (
                <>
                  <svg className="w-3.5 h-3.5 fill-[#0a66c2]" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  <span>LinkedIn Feed</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 fill-[#e1306c]" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram Feed</span>
                </>
              )}
            </div>
          )}

          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold uppercase ${
            isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {post.status}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!isSuccess && (
            <button
              type="button"
              onClick={handleRetry}
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white"
              title="Retry broadcast"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400"
            title="Delete post"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Actual Social Media Card Body */}
      <div className="p-4 sm:p-5">
        
        {/* Author Header */}
        {isX ? (
          /* X (Twitter) Header */
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                P
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[15px] text-white hover:underline cursor-pointer">Pagal</span>
                  <CheckCircle2 className="w-4 h-4 fill-[#1d9bf0] text-black" />
                  <span className="text-neutral-500 text-[14px]">@Pagal88114784</span>
                  <span className="text-neutral-500 text-[14px]">·</span>
                  <span className="text-neutral-500 text-[14px]">
                    {postDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {activeLog?.post_url && (
              <a
                href={activeLog.post_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#1d9bf0] hover:bg-[#1d9bf0]/10 p-1.5 rounded-full transition-colors"
                title="View on X"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        ) : isLinkedIn ? (
          /* LinkedIn Header */
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-base shadow">
                P
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-white text-[15px] hover:text-[#70b5f8] cursor-pointer">Pankaj kumar</span>
                  <span className="text-xs text-neutral-400">• 1st</span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-1">Building Automation & Software Systems</p>
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5">
                  <span>{postDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  <span>•</span>
                  <Globe className="w-3 h-3 text-neutral-400" />
                </div>
              </div>
            </div>

            {activeLog?.post_url && (
              <a
                href={activeLog.post_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#70b5f8] hover:bg-[#70b5f8]/10 p-1.5 rounded-full transition-colors"
                title="View on LinkedIn"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        ) : (
          /* Instagram Header */
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shrink-0">
                <div className="p-[1px] bg-black rounded-full">
                  <div className="w-9 h-9 rounded-full bg-[#111116] flex items-center justify-center text-white font-bold text-sm shadow">
                    P
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-[14px] hover:underline cursor-pointer">pankajkumar_240666</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-0.5">
                  <span>Original Audio</span>
                  <span>•</span>
                  <span>{postDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {activeLog?.post_url && (
              <a
                href={activeLog.post_url}
                target="_blank"
                rel="noreferrer"
                className="text-[#ee2a7b] hover:bg-[#ee2a7b]/10 p-1.5 rounded-full transition-colors"
                title="View on Instagram"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Post Text Commentary */}
        <div className={`mt-3 text-[14px] sm:text-[15px] leading-relaxed break-words whitespace-pre-wrap ${
          isX ? 'text-neutral-100' : 'text-neutral-200'
        }`}>
          {renderFormattedText(effectiveText)}
        </div>

        {/* Media Attachments Preview */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className={`mt-3 rounded-2xl overflow-hidden border border-neutral-800 grid gap-1 ${
            post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {post.media_urls.map((url, idx) => (
              <div key={idx} className="relative aspect-video bg-neutral-900 overflow-hidden">
                <img
                  src={url}
                  alt={`Attached media ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Bottom Social Interactive Action Bar */}
        <div className={`flex items-center justify-between text-xs mt-4 pt-3 border-t ${
          isX ? 'border-neutral-900 text-neutral-500' : 'border-neutral-800 text-neutral-400'
        }`}>
          {/* Comments / Replies */}
          <button 
            type="button"
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="flex items-center gap-2 hover:text-[#1d9bf0] transition-colors cursor-pointer group"
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform text-sky-400" />
            <span className="font-mono">{metrics.replies}</span>
          </button>

          {/* Reposts */}
          <div className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
            <Repeat2 className="w-4 h-4 text-emerald-400" />
            <span className="font-mono">{metrics.reposts}</span>
          </div>

          {/* Likes */}
          <div className="flex items-center gap-2 hover:text-rose-400 transition-colors">
            <Heart className="w-4 h-4 text-rose-400" />
            <span className="font-mono">{metrics.likes}</span>
          </div>

          {/* Impressions / Views */}
          <div className="flex items-center gap-2 hover:text-purple-400 transition-colors">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="font-mono">{metrics.impressions}</span>
          </div>

          {/* Open live post link */}
          {activeLog?.post_url && (
            <a
              href={activeLog.post_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[11px] hover:underline text-[#00f2fe]"
            >
              <span>Live Post</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

      </div>

      {/* Accordion Discussion Drawer & In-App Reply Composer */}
      {isCommentsOpen && (
        <div className="bg-black/60 border-t border-white/[0.08] p-4 sm:p-5 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono">
              Live Discussion & Replies ({Math.max(metrics.replies, comments.filter(c => c.platform === activePlatform).length)})
            </span>
            <span className="text-[11px] text-neutral-400">
              Posting directly to {activePlatform.toUpperCase()}
            </span>
          </div>

          {/* Live External Thread Notice if replies exist on network */}
          {metrics.replies > 0 && activeLog?.post_url && (
            <div className="bg-sky-500/10 border border-sky-500/25 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-neutral-200">
                <MessageCircle className="w-4 h-4 text-[#1d9bf0] shrink-0" />
                <span>
                  <strong className="text-white font-mono">{metrics.replies}</strong> live {metrics.replies === 1 ? 'reply' : 'replies'} on {activePlatform.toUpperCase()}
                </span>
              </div>
              <a
                href={activeLog.post_url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-[#1d9bf0]/20 hover:bg-[#1d9bf0]/30 text-[#1d9bf0] font-semibold text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Read on {activePlatform.toUpperCase()}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Existing Comments List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {comments.filter(c => c.platform === activePlatform).length === 0 ? (
              <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3 text-center text-xs text-neutral-400">
                {metrics.replies > 0 
                  ? `There are ${metrics.replies} replies on ${activePlatform.toUpperCase()} (click "Read on ${activePlatform.toUpperCase()}" above to see public replies, or post a new reply below!)`
                  : `No replies recorded yet. Type below to publish a reply to the live post!`}
              </div>
            ) : (
              comments.filter(c => c.platform === activePlatform).map((c) => (
                <div key={c.id} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span>{c.author_name}</span>
                      {c.author_handle && (
                        <span className="text-[10px] text-neutral-400 font-mono">({c.author_handle})</span>
                      )}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">{c.platform}</span>
                  </div>
                  <p className="text-neutral-200 leading-relaxed mt-0.5">{c.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* AI Reply Suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="bg-white/[0.04] border border-[#ff3b8f]/30 rounded-xl p-3 space-y-2">
              <div className="text-[11px] font-semibold text-[#ff3b8f] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Suggestions (Click to select):</span>
              </div>
              <div className="space-y-1.5">
                {aiSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(sug)}
                    className="w-full text-left text-xs p-2 rounded-lg bg-black/40 hover:bg-[#ff3b8f]/10 border border-white/[0.06] hover:border-[#ff3b8f]/40 text-neutral-200 transition-all cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reply Textarea & Buttons */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                Reply as author on <span className="uppercase text-white font-semibold">{activePlatform}</span>
              </span>

              <button
                type="button"
                onClick={handleSuggestAIReply}
                disabled={loadingAI}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ff3b8f]/15 hover:bg-[#ff3b8f]/25 border border-[#ff3b8f]/30 text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className={`w-3 h-3 ${loadingAI ? 'animate-spin' : ''}`} />
                <span>{loadingAI ? 'Generating...' : '✨ Suggest AI Reply'}</span>
              </button>
            </div>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Write your reply to this ${activePlatform.toUpperCase()} post...`}
              rows={2}
              className="w-full bg-black/50 border border-white/[0.08] rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00f2fe]/50 resize-none"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSendReply}
                disabled={submittingReply || !replyText.trim()}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#ff3b8f] via-[#a855f7] to-[#00f2fe] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReply ? 'Dispatching...' : 'Publish Reply'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
