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
        // format ISO to datetime-local input string
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
      setStatusMessage({ type: 'error', text: 'Enter a draft or thought first to adapt with AI.' });
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
      setStatusMessage({ type: 'success', text: 'Adapted tailored versions for X and LinkedIn!' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to adapt content via AI service.' });
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
      setStatusMessage({ type: 'error', text: 'Please pick a date & time for scheduled publishing.' });
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
        text: publishImmediately ? 'Broadcast triggered successfully!' : 'Post saved & scheduled successfully!'
      });

      // Reset form if immediate or scheduled
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
    <div className="bg-[#12141c] border border-neutral-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
      {/* Platform Target Selection Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 font-mono">
            Publish To:
          </span>
          <button
            type="button"
            onClick={() => togglePlatform('x')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              targetPlatforms.includes('x')
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'bg-neutral-900/50 text-neutral-500 border border-neutral-800/50 hover:border-neutral-700'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>X (Twitter)</span>
            {targetPlatforms.includes('x') && <Check className="w-3.5 h-3.5 text-neutral-300" />}
          </button>

          <button
            type="button"
            onClick={() => togglePlatform('linkedin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              targetPlatforms.includes('linkedin')
                ? 'bg-[#0a66c2]/20 text-[#70b5f8] border border-[#0a66c2]/40'
                : 'bg-neutral-900/50 text-neutral-500 border border-neutral-800/50 hover:border-neutral-700'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            <span>LinkedIn</span>
            {targetPlatforms.includes('linkedin') && <Check className="w-3.5 h-3.5 text-[#70b5f8]" />}
          </button>
        </div>

        {/* AI Format / Adapt Button */}
        <button
          type="button"
          onClick={handleAIAdapt}
          disabled={isAdaptingAI || !content.trim()}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60 flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
          title="Auto-adapt for X and LinkedIn lengths"
        >
          {isAdaptingAI ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>Format with AI</span>
        </button>
      </div>

      {/* Editor Tabs if overrides enabled */}
      {customOverrides && (
        <div className="flex items-center gap-1 bg-neutral-900/60 p-1 rounded-lg border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'master' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Universal Master
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('x')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'x' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>X Draft</span>
            <span className={`text-[10px] px-1 rounded ${
              xContent.length > 280 ? 'bg-rose-500/20 text-rose-400' : 'text-neutral-400'
            }`}>
              {xContent.length}/280
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('linkedin')}
            className={`px-3 py-1 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'linkedin' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>LinkedIn Draft</span>
            <span className="text-[10px] text-neutral-400">
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
            placeholder="What's happening? Compose your post here to broadcast across X & LinkedIn..."
            className="w-full bg-neutral-950/70 border border-neutral-800 focus:border-neutral-600 rounded-xl p-3.5 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all resize-y"
          />
        )}
        {activeTab === 'x' && (
          <textarea
            rows={5}
            value={xContent}
            onChange={(e) => setXContent(e.target.value)}
            placeholder="Custom draft tailored specifically for X (Twitter) (Max 280 characters)..."
            className="w-full bg-neutral-950/70 border border-neutral-800 focus:border-neutral-600 rounded-xl p-3.5 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all resize-y"
          />
        )}
        {activeTab === 'linkedin' && (
          <textarea
            rows={6}
            value={linkedinContent}
            onChange={(e) => setLinkedinContent(e.target.value)}
            placeholder="Custom draft tailored specifically for LinkedIn (Professional hook, takeaways, hashtags)..."
            className="w-full bg-neutral-950/70 border border-neutral-800 focus:border-neutral-600 rounded-xl p-3.5 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all resize-y"
          />
        )}

        {/* Character Metrics Footer */}
        <div className="flex items-center justify-between text-xs text-neutral-400 mt-2 px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-mono">
              <span className="text-neutral-500">X:</span>
              <span className={effectiveXText.length > 280 ? 'text-rose-400 font-bold' : 'text-neutral-300'}>
                {effectiveXText.length}/280
              </span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <span className="text-neutral-500">LinkedIn:</span>
              <span className={effectiveLiText.length > 3000 ? 'text-rose-400 font-bold' : 'text-neutral-300'}>
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
            className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{customOverrides ? 'Use Single Master Post' : 'Customize per platform'}</span>
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
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Scheduled publication time:</span>
          </div>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
      )}

      {/* Feedback Alert */}
      {statusMessage && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
          statusMessage.type === 'error'
            ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
            : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
        }`}>
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          ) : (
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsScheduling(!isScheduling)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              isScheduling
                ? 'bg-neutral-800 border-neutral-700 text-emerald-400'
                : 'bg-transparent border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isScheduling ? 'Schedule Active' : 'Schedule for later'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit(isScheduling ? false : true)}
          disabled={isSubmitting || (effectiveXText.length > 280 && targetPlatforms.includes('x'))}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
            isScheduling
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-white hover:bg-neutral-200 text-neutral-950'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isScheduling ? (
            <>
              <Clock className="w-4 h-4" />
              <span>{isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Now'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
