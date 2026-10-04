import React, { useState, useEffect } from 'react';
import { Send, Clock, Sparkles, Check, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import MediaUploader from './MediaUploader';
import { createPost, aiAdaptContent } from '../api/client';

export default function Composer({ onPostCreated, selectedPostToEdit = null, onDraftChange = null }) {
  // Post state
  const [content, setContent] = useState('');
  const [xContent, setXContent] = useState('');
  const [linkedinContent, setLinkedinContent] = useState('');
  const [customOverrides, setCustomOverrides] = useState(false);
  const [activeTab, setActiveTab] = useState('master'); // 'master' | 'x' | 'linkedin'
  const [targetPlatforms, setTargetPlatforms] = useState(['x', 'linkedin']);
  const [mediaUrls, setMediaUrls] = useState([]);
  
  // Scheduling state
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdaptingAI, setIsAdaptingAI] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Sync edits if editing an existing post
  useEffect(() => {
    if (selectedPostToEdit) {
      setContent(selectedPostToEdit.content || '');
      setXContent(selectedPostToEdit.x_content || '');
      setLinkedinContent(selectedPostToEdit.linkedin_content || '');
      setMediaUrls(selectedPostToEdit.media_urls || []);
      setTargetPlatforms(selectedPostToEdit.target_platforms || ['x', 'linkedin']);
      if (selectedPostToEdit.x_content || selectedPostToEdit.linkedin_content) {
        setCustomOverrides(true);
      }
      if (selectedPostToEdit.scheduled_at) {
        setIsScheduling(true);
        try {
          const d = new Date(selectedPostToEdit.scheduled_at);
          setScheduledAt(d.toISOString().slice(0, 16));
        } catch (e) {}
      }
    }
  }, [selectedPostToEdit]);

  // Synchronize draft state to parent for real-time live previews
  useEffect(() => {
    if (onDraftChange) {
      onDraftChange({
        content,
        xContent: customOverrides && xContent ? xContent : content,
        linkedinContent: customOverrides && linkedinContent ? linkedinContent : content,
        mediaUrls,
        customOverrides
      });
    }
  }, [content, xContent, linkedinContent, customOverrides, mediaUrls, onDraftChange]);

  // Derived effective texts
  const effectiveXText = (customOverrides && xContent) ? xContent : content;
  const effectiveLiText = (customOverrides && linkedinContent) ? linkedinContent : content;

  const togglePlatform = (p) => {
    if (targetPlatforms.includes(p)) {
      if (targetPlatforms.length > 1) {
        setTargetPlatforms(targetPlatforms.filter(item => item !== p));
      }
    } else {
      setTargetPlatforms([...targetPlatforms, p]);
    }
  };

  const handleAIAdapt = async () => {
    if (!content.trim()) {
      setStatusMessage({ type: 'error', text: 'Enter a draft or topic first to format with AI.' });
      return;
    }
    setIsAdaptingAI(true);
    setStatusMessage(null);
    try {
      const res = await aiAdaptContent({
        topic_or_draft: content,
        tone: 'engaging'
      });
      setCustomOverrides(true);
      setXContent(res.x_text);
      setLinkedinContent(res.linkedin_text);
      setStatusMessage({ type: 'success', text: 'Synthesized tailored drafts for X and LinkedIn!' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to format content via AI service.' });
    } finally {
      setIsAdaptingAI(false);
    }
  };

  const handleSubmit = async (publishImmediately = false) => {
    const activeText = content.trim();
    if (!activeText && mediaUrls.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please write some content or attach media.' });
      return;
    }

    if (isScheduling && !scheduledAt && !publishImmediately) {
      setStatusMessage({ type: 'error', text: 'Please select a date & time for scheduled publishing.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        title: activeText.slice(0, 50),
        content: activeText,
        x_content: customOverrides && xContent.trim() ? xContent.trim() : null,
        linkedin_content: customOverrides && linkedinContent.trim() ? linkedinContent.trim() : null,
        media_urls: mediaUrls,
        target_platforms: targetPlatforms,
        scheduled_at: isScheduling && scheduledAt && !publishImmediately ? new Date(scheduledAt).toISOString() : null,
        publish_immediately: publishImmediately
      };

      const newPost = await createPost(payload);
      setStatusMessage({
        type: 'success',
        text: publishImmediately ? 'Post dispatched to target networks!' : 'Post scheduled successfully!'
      });

      // Reset form
      setContent('');
      setXContent('');
      setLinkedinContent('');
      setMediaUrls([]);
      setScheduledAt('');
      setIsScheduling(false);
      setCustomOverrides(false);
      setActiveTab('master');

      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Error saving or publishing post.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0b0c14]/90 border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 backdrop-blur-xl relative overflow-hidden">
      {/* Target Networks Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs uppercase tracking-wider font-bold text-neutral-400 font-mono">
            Networks:
          </span>

          {/* X (Twitter) Target Button */}
          <button
            type="button"
            onClick={() => togglePlatform('x')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              targetPlatforms.includes('x')
                ? 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/60 shadow-[0_0_15px_rgba(0,242,254,0.25)]'
                : 'bg-white/[0.03] text-neutral-400 border border-white/[0.08] hover:border-neutral-600'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>X (Twitter)</span>
            {targetPlatforms.includes('x') && <Check className="w-3.5 h-3.5 text-[#00f2fe]" />}
          </button>

          {/* LinkedIn Target Button */}
          <button
            type="button"
            onClick={() => togglePlatform('linkedin')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              targetPlatforms.includes('linkedin')
                ? 'bg-[#a855f7]/15 text-violet-300 border border-[#a855f7]/60 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : 'bg-white/[0.03] text-neutral-400 border border-white/[0.08] hover:border-neutral-600'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            <span>LinkedIn</span>
            {targetPlatforms.includes('linkedin') && <Check className="w-3.5 h-3.5 text-[#a855f7]" />}
          </button>
        </div>

        {/* AI Synthesis / Format Button */}
        <button
          type="button"
          onClick={handleAIAdapt}
          disabled={isAdaptingAI || !content.trim()}
          className="text-xs font-bold px-4 py-1.5 rounded-full border border-[#ff3b8f]/50 bg-gradient-to-r from-[#ff3b8f]/20 via-[#a855f7]/20 to-[#00f2fe]/20 hover:from-[#ff3b8f]/40 hover:to-[#00f2fe]/40 text-white flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(255,59,143,0.25)] cursor-pointer"
        >
          {isAdaptingAI ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#ff3b8f]" />
          )}
          <span>Format with AI</span>
        </button>
      </div>

      {/* Editor Tabs if platform overrides active */}
      {customOverrides && (
        <div className="flex items-center gap-1.5 bg-[#07080d] p-1.5 rounded-full border border-white/[0.08] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
              activeTab === 'master'
                ? 'bg-gradient-to-r from-[#ff3b8f] to-[#a855f7] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Master Draft
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('x')}
            className={`px-4 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'x'
                ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/50 shadow-sm'
                : 'text-neutral-400 hover:text-[#00f2fe]'
            }`}
          >
            <span>X (Twitter)</span>
            <span className={`text-[10px] font-mono px-1.5 rounded-full ${
              xContent.length > 280 ? 'bg-rose-500/30 text-rose-300' : 'text-neutral-400'
            }`}>
              {xContent.length}/280
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('linkedin')}
            className={`px-4 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'linkedin'
                ? 'bg-[#a855f7]/20 text-violet-300 border border-[#a855f7]/50 shadow-sm'
                : 'text-neutral-400 hover:text-violet-300'
            }`}
          >
            <span>LinkedIn</span>
            <span className="text-[10px] font-mono text-neutral-400">
              {linkedinContent.length}/3000
            </span>
          </button>
        </div>
      )}

      {/* Main Composition Textarea */}
      <div className="relative">
        {activeTab === 'master' && (
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your message or update here to broadcast across X & LinkedIn..."
            className="w-full bg-[#05060a] border border-white/[0.08] focus:border-[#00f2fe]/60 rounded-2xl p-4 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#00f2fe]/30 transition-all resize-y shadow-inner"
          />
        )}
        {activeTab === 'x' && (
          <textarea
            rows={5}
            value={xContent}
            onChange={(e) => setXContent(e.target.value)}
            placeholder="Tailor specifically for X (Punchy hook, hashtags, under 280 chars)..."
            className="w-full bg-[#05060a] border border-[#00f2fe]/40 focus:border-[#00f2fe] rounded-2xl p-4 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#00f2fe]/40 transition-all resize-y shadow-inner"
          />
        )}
        {activeTab === 'linkedin' && (
          <textarea
            rows={6}
            value={linkedinContent}
            onChange={(e) => setLinkedinContent(e.target.value)}
            placeholder="Tailor specifically for LinkedIn (Professional narrative, bullet takeaways, call-to-action)..."
            className="w-full bg-[#05060a] border border-[#a855f7]/40 focus:border-[#a855f7] rounded-2xl p-4 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-[#a855f7]/40 transition-all resize-y shadow-inner"
          />
        )}

        {/* Character Metrics & Override Toggle */}
        <div className="flex items-center justify-between text-xs text-neutral-400 mt-2 px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="text-neutral-400 font-semibold">X:</span>
              <span className={`font-bold ${
                effectiveXText.length > 280
                  ? 'text-rose-400'
                  : 'text-[#00f2fe]'
              }`}>
                {effectiveXText.length}/280
              </span>
            </span>

            <span className="flex items-center gap-1.5 font-mono">
              <span className="text-neutral-400 font-semibold">LinkedIn:</span>
              <span className={`font-bold ${
                effectiveLiText.length > 3000
                  ? 'text-rose-400'
                  : 'text-violet-400'
              }`}>
                {effectiveLiText.length}/3000
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!customOverrides) {
                setXContent(content);
                setLinkedinContent(content);
              }
              setCustomOverrides(!customOverrides);
            }}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#ff3b8f]" />
            <span>{customOverrides ? 'Revert to Single Master Draft' : 'Customize per platform'}</span>
          </button>
        </div>
      </div>

      {/* Media Attachments Dropzone */}
      <MediaUploader
        mediaUrls={mediaUrls}
        onChange={setMediaUrls}
      />

      {/* Schedule Picker Bar */}
      {isScheduling && (
        <div className="bg-[#05060a] border border-[#00f2fe]/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2 text-cyan-300">
            <Clock className="w-4 h-4 text-[#00f2fe]" />
            <span className="font-semibold">Scheduled Broadcast Time:</span>
          </div>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="bg-[#0c0e18] border border-white/[0.1] rounded-xl px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-[#00f2fe] font-mono"
          />
        </div>
      )}

      {/* Feedback Alert */}
      {statusMessage && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 border shadow-sm ${
          statusMessage.type === 'error'
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
        }`}>
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          ) : (
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsScheduling(!isScheduling)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
              isScheduling
                ? 'bg-[#00f2fe]/20 border-[#00f2fe]/60 text-[#00f2fe] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                : 'bg-white/[0.03] border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isScheduling ? 'Schedule Active' : 'Schedule'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-40 cursor-pointer"
          >
            Save Draft
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit(isScheduling ? false : true)}
          disabled={isSubmitting || (effectiveXText.length > 280 && targetPlatforms.includes('x'))}
          className={`px-7 py-2.5 rounded-full text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
            isScheduling
              ? 'border border-[#00f2fe] bg-gradient-to-r from-[#00f2fe]/20 to-[#a855f7]/20 hover:from-[#00f2fe]/40 hover:to-[#a855f7]/40 text-white shadow-[0_0_20px_rgba(0,242,254,0.35)]'
              : 'border border-[#ff3b8f] bg-gradient-to-r from-[#ff3b8f]/30 via-[#a855f7]/30 to-[#00f2fe]/30 hover:from-[#ff3b8f]/50 hover:to-[#00f2fe]/50 text-white shadow-[0_0_25px_rgba(255,59,143,0.4)]'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isScheduling ? (
            <>
              <Clock className="w-4 h-4 text-[#00f2fe]" />
              <span>{isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-[#ff3b8f]" />
              <span>{isSubmitting ? 'Dispatching...' : 'Publish Now'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
