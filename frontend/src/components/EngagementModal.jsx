import React, { useState, useEffect } from 'react';
import { 
  X, Heart, MessageSquare, Repeat2, Eye, RefreshCw, 
  Send, Sparkles, ExternalLink, MessageCircle, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { getPostEngagement, postComment, aiSuggestReply } from '../api/client';

export default function EngagementModal({ post, onClose }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [engagement, setEngagement] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('x');
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  // Available published platforms for this post
  const publishedLogs = post?.publish_logs?.filter(l => l.status === 'SUCCESS') || [];
  const hasX = publishedLogs.some(l => l.platform === 'x');
  const hasLinkedIn = publishedLogs.some(l => l.platform === 'linkedin');

  useEffect(() => {
    if (hasX) {
      setSelectedPlatform('x');
    } else if (hasLinkedIn) {
      setSelectedPlatform('linkedin');
    }
    fetchEngagement();
  }, [post?.id]);

  const fetchEngagement = async (isManualRefresh = false) => {
    if (!post?.id) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getPostEngagement(post.id);
      setEngagement(data);
    } catch (err) {
      console.error('Error fetching engagement:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSuggestAIReply = async () => {
    setLoadingAI(true);
    setStatusMessage(null);
    try {
      const res = await aiSuggestReply({
        post_content: post.content,
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
        platform: selectedPlatform,
        content: replyText.trim()
      });
      setReplyText('');
      setAiSuggestions([]);
      setStatusMessage({ 
        type: 'success', 
        text: `Reply dispatched directly to ${selectedPlatform.toUpperCase()}!` 
      });
      await fetchEngagement(true);
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#111116] rounded-[28px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[8px_8px_0px_#111116] overflow-hidden text-[#111116]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b-2 border-[#111116] bg-[#fef7e6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#6CEBB0] border-2 border-[#111116] flex items-center justify-center text-[#111116] shadow-[2px_2px_0px_#111116]">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-[#111116] flex items-center gap-2">
                <span>Engagement Hub</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white border border-[#111116]">
                  Post #{post?.id}
                </span>
              </h2>
              <p className="text-xs text-[#111116]/60 font-medium">
                Live metrics, discussion tracker, and AI-assisted thread replying
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchEngagement(true)}
              disabled={refreshing}
              className="w-8 h-8 rounded-full bg-white border-2 border-[#111116] flex items-center justify-center text-[#111116] hover:bg-[#ffe400] shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
              title="Refresh live metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#6a6afe]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border-2 border-[#111116] flex items-center justify-center text-[#111116] hover:bg-[#ffebee] shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Original Post Preview */}
          <div className="bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl p-4 shadow-[2px_2px_0px_#111116]">
            <div className="text-[10px] uppercase font-display font-bold tracking-wider text-[#111116]/60 mb-1">
              Broadcasted Content
            </div>
            <p className="text-xs text-[#111116] line-clamp-3 leading-relaxed font-medium">
              {post?.content}
            </p>
          </div>

          {/* Live Metrics Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-display font-bold text-[#111116] uppercase tracking-wider">
                Live Performance Metrics
              </span>
              <span className="text-[11px] text-[#111116]/60 font-medium">
                Real-time sync with network APIs
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-[#111116]/60 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#6a6afe]" />
                <span className="font-display font-bold">Fetching live metrics...</span>
              </div>
            ) : engagement?.metrics?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {engagement.metrics.map((m, idx) => (
                  <React.Fragment key={idx}>
                    <div className="bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl p-3 flex flex-col justify-between shadow-[2px_2px_0px_#111116]">
                      <div className="flex items-center justify-between text-[#111116]/70 mb-1 font-display font-bold">
                        <span className="text-xs flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 text-[#ff6a91]" />
                          <span>Likes</span>
                        </span>
                        <span className="text-[10px] uppercase">{m.platform}</span>
                      </div>
                      <span className="text-2xl font-black font-display text-[#111116]">{m.likes}</span>
                    </div>

                    <div className="bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl p-3 flex flex-col justify-between shadow-[2px_2px_0px_#111116]">
                      <div className="flex items-center justify-between text-[#111116]/70 mb-1 font-display font-bold">
                        <span className="text-xs flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-[#6a6afe]" />
                          <span>Replies</span>
                        </span>
                        <span className="text-[10px] uppercase">{m.platform}</span>
                      </div>
                      <span className="text-2xl font-black font-display text-[#111116]">{m.replies}</span>
                    </div>

                    <div className="bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl p-3 flex flex-col justify-between shadow-[2px_2px_0px_#111116]">
                      <div className="flex items-center justify-between text-[#111116]/70 mb-1 font-display font-bold">
                        <span className="text-xs flex items-center gap-1">
                          <Repeat2 className="w-3.5 h-3.5 text-[#2e7d32]" />
                          <span>Reposts</span>
                        </span>
                        <span className="text-[10px] uppercase">{m.platform}</span>
                      </div>
                      <span className="text-2xl font-black font-display text-[#111116]">{m.reposts}</span>
                    </div>

                    <div className="bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl p-3 flex flex-col justify-between shadow-[2px_2px_0px_#111116]">
                      <div className="flex items-center justify-between text-[#111116]/70 mb-1 font-display font-bold">
                        <span className="text-xs flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-[#ff6a91]" />
                          <span>Views</span>
                        </span>
                        {m.post_url && (
                          <a 
                            href={m.post_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[#6a6afe] hover:underline"
                            title="Open live post"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-2xl font-black font-display text-[#111116]">{m.impressions}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl p-4 text-center text-xs text-[#111116]/60 font-medium">
                No active metrics yet for this post.
              </div>
            )}
          </div>

          {/* Discussion & In-App Replying */}
          <div className="space-y-3.5 pt-3 border-t-2 border-[#111116]/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-bold text-[#111116] uppercase tracking-wider">
                Discussion Stream ({engagement?.comments?.length || 0})
              </span>
              
              {/* Platform Selector */}
              <div className="flex items-center gap-1 bg-[#fef7e6] border-2 border-[#111116] p-1 rounded-full text-xs font-display font-bold shadow-[2px_2px_0px_#111116]">
                {hasX && (
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('x')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      selectedPlatform === 'x' ? 'bg-[#111116] text-white shadow-sm' : 'text-[#111116] hover:bg-white'
                    }`}
                  >
                    X (Twitter)
                  </button>
                )}
                {hasLinkedIn && (
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('linkedin')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      selectedPlatform === 'linkedin' ? 'bg-[#6a6afe] text-white shadow-sm' : 'text-[#111116] hover:bg-white'
                    }`}
                  >
                    LinkedIn
                  </button>
                )}
              </div>
            </div>

            {/* Live External Thread Notice */}
            {(() => {
              const currentM = engagement?.metrics?.find(m => m.platform === selectedPlatform);
              const repCount = currentM?.replies || 0;
              const postUrl = currentM?.post_url;

              return repCount > 0 && postUrl ? (
                <div className="bg-[#e8f4fd] border-2 border-[#111116] rounded-2xl p-3 flex items-center justify-between text-xs shadow-[2px_2px_0px_#111116]">
                  <div className="flex items-center gap-2 text-[#111116]">
                    <MessageCircle className="w-4 h-4 text-[#6a6afe] shrink-0" />
                    <span className="font-medium">
                      <strong className="font-display font-bold">{repCount}</strong> live {repCount === 1 ? 'reply' : 'replies'} on {selectedPlatform.toUpperCase()}
                    </span>
                  </div>
                  <a
                    href={postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-full bg-[#6a6afe] text-white font-display font-bold text-[11px] flex items-center gap-1 border border-[#111116] shadow-sm hover:translate-x-0.5 transition-transform"
                  >
                    <span>View on {selectedPlatform.toUpperCase()}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : null;
            })()}

            {/* Existing Comments List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {(engagement?.comments || []).filter(c => c.platform === selectedPlatform).length === 0 ? (
                <div className="bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl p-4 text-center text-xs text-[#111116]/60 font-medium">
                  {(() => {
                    const currentM = engagement?.metrics?.find(m => m.platform === selectedPlatform);
                    const repCount = currentM?.replies || 0;
                    return repCount > 0
                      ? `There are ${repCount} live replies on ${selectedPlatform.toUpperCase()} (click "View on ${selectedPlatform.toUpperCase()}" above, or send a reply directly below!)`
                      : `No replies recorded yet. Send a reply below to start the live thread!`;
                  })()}
                </div>
              ) : (
                engagement?.comments?.filter(c => c.platform === selectedPlatform).map((c) => (
                  <div key={c.id} className="bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl p-3 text-xs flex flex-col gap-1 shadow-[2px_2px_0px_#111116]">
                    <div className="flex items-center justify-between text-[#111116]/70">
                      <span className="font-display font-bold text-[#111116] flex items-center gap-1.5">
                        <span>{c.author_name}</span>
                        {c.author_handle && (
                          <span className="text-[10px] text-[#111116]/60 font-mono">({c.author_handle})</span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#111116]/60 uppercase">{c.platform}</span>
                    </div>
                    <p className="text-[#111116] leading-relaxed mt-0.5 font-medium">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Status message */}
            {statusMessage && (
              <div className={`p-3 rounded-2xl text-xs font-medium flex items-center gap-2 border-2 border-[#111116] shadow-[2px_2px_0px_#111116] ${
                statusMessage.type === 'success' 
                  ? 'bg-[#e8f8f0] text-[#1b5e20]' 
                  : 'bg-[#ffebee] text-[#b71c1c]'
              }`}>
                {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* AI Reply Quick Suggestions */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-display font-bold text-[#111116]/70 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#6a6afe]" />
                  <span>AI Response Suggestions</span>
                </span>
                <button
                  type="button"
                  onClick={handleSuggestAIReply}
                  disabled={loadingAI}
                  className="text-xs font-display font-bold text-[#6a6afe] hover:text-[#5252eb] flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingAI ? 'animate-spin' : ''}`} />
                  <span>{loadingAI ? 'Generating...' : 'Suggest 3 Variants'}</span>
                </button>
              </div>

              {aiSuggestions.length > 0 && (
                <div className="flex flex-col gap-2">
                  {aiSuggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setReplyText(sug)}
                      className="text-left text-xs bg-[#ffe400]/40 hover:bg-[#ffe400] border-2 border-[#111116] p-2.5 rounded-xl text-[#111116] font-medium transition-all shadow-[2px_2px_0px_#111116] hover:translate-x-0.5 cursor-pointer"
                    >
                      "{sug}"
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Reply Composer Input */}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                  placeholder={`Write your direct reply to ${selectedPlatform.toUpperCase()}...`}
                  className="flex-1 bg-white border-2 border-[#111116] focus:border-[#6a6afe] rounded-2xl px-4 py-2.5 text-xs text-[#111116] placeholder-[#111116]/40 font-medium focus:outline-none focus:ring-2 focus:ring-[#6a6afe]/20 shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={submittingReply || !replyText.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-[#6a6afe] hover:bg-[#5858f5] text-white border-2 border-[#111116] font-display font-bold text-xs flex items-center gap-1.5 shadow-[3px_3px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReply ? 'Sending...' : 'Reply Live'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
