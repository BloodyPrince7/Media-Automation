import React, { useState, useEffect } from 'react';
import { Send, Clock, Sparkles, Check, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import MediaUploader from './MediaUploader';
import { createPost, aiAdaptContent } from '../api/client';

export default function Composer({ onPostCreated, selectedPostToEdit = null, onDraftChange = null }) {
  // Post state
  const [content, setContent] = useState('');
  const [xContent, setXContent] = useState('');
  const [linkedinContent, setLinkedinContent] = useState('');
  const [instagramContent, setInstagramContent] = useState('');
  const [customOverrides, setCustomOverrides] = useState(false);
  const [activeTab, setActiveTab] = useState('master'); // 'master' | 'x' | 'linkedin' | 'instagram'
  const [targetPlatforms, setTargetPlatforms] = useState(['x', 'linkedin', 'instagram']);
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
      setInstagramContent(selectedPostToEdit.instagram_content || '');
      setMediaUrls(selectedPostToEdit.media_urls || []);
      setTargetPlatforms(selectedPostToEdit.target_platforms || ['x', 'linkedin', 'instagram']);
      if (selectedPostToEdit.x_content || selectedPostToEdit.linkedin_content || selectedPostToEdit.instagram_content) {
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
        instagramContent: customOverrides && instagramContent ? instagramContent : content,
        mediaUrls,
        customOverrides
      });
    }
  }, [content, xContent, linkedinContent, instagramContent, customOverrides, mediaUrls, onDraftChange]);

  // Derived effective texts
  const effectiveXText = (customOverrides && xContent) ? xContent : content;
  const effectiveLiText = (customOverrides && linkedinContent) ? linkedinContent : content;
  const effectiveIgText = (customOverrides && instagramContent) ? instagramContent : content;

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
    if (!content.trim() && mediaUrls.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please enter draft notes or attach media to generate optimized variants.' });
      return;
    }
    setIsAdaptingAI(true);
    setStatusMessage(null);
    try {
      const res = await aiAdaptContent({
        topic_or_draft: content,
        tone: 'engaging',
        media_urls: mediaUrls
      });
      setCustomOverrides(true);
      setXContent(res.x_text);
      setLinkedinContent(res.linkedin_text);
      setInstagramContent(res.instagram_text || '');
      if (!content.trim()) {
        setContent(res.linkedin_text);
      }
      setStatusMessage({ type: 'success', text: 'Channel variants tailored and optimized successfully for all channels.' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Content optimization request failed. Please check connection.' });
    } finally {
      setIsAdaptingAI(false);
    }
  };

  const handleSubmit = async (publishImmediately = false) => {
    const activeText = content.trim();
    if (!activeText && mediaUrls.length === 0) {
      setStatusMessage({ type: 'error', text: 'Please provide message content or attach media.' });
      return;
    }

    if (targetPlatforms.includes('instagram') && mediaUrls.length === 0) {
      setStatusMessage({ type: 'error', text: 'Instagram requires at least one image or video attachment before publishing.' });
      return;
    }

    if (isScheduling && !scheduledAt && !publishImmediately) {
      setStatusMessage({ type: 'error', text: 'Please specify a target publication date and time.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        title: activeText ? activeText.slice(0, 50) : "Media Broadcast",
        content: activeText || (customOverrides && instagramContent.trim()) || "Media Broadcast",
        x_content: customOverrides && xContent.trim() ? xContent.trim() : null,
        linkedin_content: customOverrides && linkedinContent.trim() ? linkedinContent.trim() : null,
        instagram_content: customOverrides && instagramContent.trim() ? instagramContent.trim() : null,
        media_urls: mediaUrls,
        target_platforms: targetPlatforms,
        scheduled_at: isScheduling && scheduledAt && !publishImmediately ? new Date(scheduledAt).toISOString() : null,
        publish_immediately: publishImmediately
      };

      const newPost = await createPost(payload);
      setStatusMessage({
        type: 'success',
        text: publishImmediately ? 'Broadcast dispatched to selected channels.' : 'Broadcast scheduled successfully in queue.'
      });

      // Reset form
      setContent('');
      setXContent('');
      setLinkedinContent('');
      setInstagramContent('');
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
      const errorDetail = err.response?.data?.detail;
      const errorMsg = typeof errorDetail === 'string'
        ? errorDetail
        : Array.isArray(errorDetail)
          ? errorDetail.map(d => d.msg || JSON.stringify(d)).join(', ')
          : err.message || 'Error processing campaign publication.';
      setStatusMessage({
        type: 'error',
        text: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="neo-box p-6 sm:p-7 flex flex-col gap-5 bg-white relative overflow-hidden">
      
      {/* Target Channels Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#111116]/10 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs uppercase tracking-wider font-display font-bold text-[#111116]/70">
            Publish To Channels:
          </span>

          {/* Primary Channel A Button */}
          <button
            type="button"
            onClick={() => togglePlatform('x')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold flex items-center gap-2 border-2 border-[#111116] transition-all cursor-pointer ${
              targetPlatforms.includes('x')
                ? 'bg-[#111116] text-white shadow-[2px_2px_0px_#6a6afe]'
                : 'bg-white text-[#111116] hover:bg-[#fef7e6]'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>X (Twitter)</span>
            {targetPlatforms.includes('x') && <Check className="w-3.5 h-3.5 text-[#6CEBB0]" />}
          </button>

          {/* Primary Channel B Button */}
          <button
            type="button"
            onClick={() => togglePlatform('linkedin')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold flex items-center gap-2 border-2 border-[#111116] transition-all cursor-pointer ${
              targetPlatforms.includes('linkedin')
                ? 'bg-[#6a6afe] text-white shadow-[2px_2px_0px_#111116]'
                : 'bg-white text-[#111116] hover:bg-[#fef7e6]'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            <span>LinkedIn</span>
            {targetPlatforms.includes('linkedin') && <Check className="w-3.5 h-3.5 text-[#ffe400]" />}
          </button>

          {/* Primary Channel C Button: Instagram */}
          <button
            type="button"
            onClick={() => togglePlatform('instagram')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-display font-bold flex items-center gap-2 border-2 border-[#111116] transition-all cursor-pointer ${
              targetPlatforms.includes('instagram')
                ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-[2px_2px_0px_#111116]'
                : 'bg-white text-[#111116] hover:bg-[#fef7e6]'
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>Instagram</span>
            {targetPlatforms.includes('instagram') && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>

        {/* AI Content Optimization Action */}
        <button
          type="button"
          onClick={handleAIAdapt}
          disabled={isAdaptingAI || (!content.trim() && mediaUrls.length === 0)}
          className="text-xs font-display font-bold px-4 py-1.5 rounded-full bg-[#ffe400] text-[#111116] border-2 border-[#111116] flex items-center gap-1.5 shadow-[2px_2px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-40 cursor-pointer"
        >
          {isAdaptingAI ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#ff6a91]" />
          )}
          <span>{mediaUrls.length > 0 && !content.trim() ? 'Generate Media Caption' : 'Optimize Content with AI'}</span>
        </button>
      </div>

      {/* Editor Tabs if platform overrides active */}
      {customOverrides && (
        <div className="flex items-center gap-1.5 bg-[#fef7e6] p-1.5 rounded-full border-2 border-[#111116] text-xs font-display font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`px-3.5 py-1 rounded-full transition-all cursor-pointer ${
              activeTab === 'master'
                ? 'bg-[#111116] text-white shadow-sm'
                : 'text-[#111116] hover:bg-white'
            }`}
          >
            Master Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('x')}
            className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'x'
                ? 'bg-[#6a6afe] text-white shadow-sm'
                : 'text-[#111116] hover:bg-white'
            }`}
          >
            <span>Short-Form Variant</span>
            <span className={`text-[10px] font-mono px-1 rounded-full ${
              xContent.length > 280 ? 'bg-[#f9665f] text-white' : 'bg-white/30 text-white'
            }`}>
              {xContent.length}/280
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('linkedin')}
            className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'linkedin'
                ? 'bg-[#ff6a91] text-white shadow-sm'
                : 'text-[#111116] hover:bg-white'
            }`}
          >
            <span>Long-Form Variant</span>
            <span className="text-[10px] font-mono bg-white/30 text-white px-1 rounded-full">
              {linkedinContent.length}/3000
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('instagram')}
            className={`px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'instagram'
                ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm'
                : 'text-[#111116] hover:bg-white'
            }`}
          >
            <span>Instagram Story/Feed</span>
            <span className={`text-[10px] font-mono px-1 rounded-full ${
              instagramContent.length > 2200 ? 'bg-[#f9665f] text-white' : 'bg-white/30 text-white'
            }`}>
              {instagramContent.length}/2200
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
            placeholder="Author your campaign message, announcement, or insight here..."
            className="w-full bg-[#fdfaf3] border-2 border-[#111116] focus:border-[#6a6afe] rounded-2xl p-4 text-[#111116] placeholder-[#111116]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6a6afe]/20 transition-all resize-y shadow-inner"
          />
        )}
        {activeTab === 'x' && (
          <textarea
            rows={5}
            value={xContent}
            onChange={(e) => setXContent(e.target.value)}
            placeholder="Tailored for short-form channels (Punchy hook, key hashtags, under 280 characters)..."
            className="w-full bg-[#fdfaf3] border-2 border-[#111116] focus:border-[#111116] rounded-2xl p-4 text-[#111116] placeholder-[#111116]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/10 transition-all resize-y shadow-inner"
          />
        )}
        {activeTab === 'linkedin' && (
          <textarea
            rows={6}
            value={linkedinContent}
            onChange={(e) => setLinkedinContent(e.target.value)}
            placeholder="Tailored for professional channels (Context narrative, bullet points, call-to-action)..."
            className="w-full bg-[#fdfaf3] border-2 border-[#111116] focus:border-[#6a6afe] rounded-2xl p-4 text-[#111116] placeholder-[#111116]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#6a6afe]/20 transition-all resize-y shadow-inner"
          />
        )}
        {activeTab === 'instagram' && (
          <textarea
            rows={6}
            value={instagramContent}
            onChange={(e) => setInstagramContent(e.target.value)}
            placeholder="Tailored for Instagram (Engaging visual hook, storytelling caption, line breaks & relevant hashtags)..."
            className="w-full bg-[#fdfaf3] border-2 border-[#dc2743] rounded-2xl p-4 text-[#111116] placeholder-[#111116]/40 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#dc2743]/20 transition-all resize-y shadow-inner"
          />
        )}

        {/* Character Metrics & Override Toggle */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#111116]/70 mt-2 px-1 font-medium gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="font-display font-bold text-[#111116]">Short-Form:</span>
              <span className={`font-bold ${
                effectiveXText.length > 280
                  ? 'text-[#f9665f]'
                  : 'text-[#6a6afe]'
              }`}>
                {effectiveXText.length}/280
              </span>
            </span>

            <span className="flex items-center gap-1.5 font-mono">
              <span className="font-display font-bold text-[#111116]">Long-Form:</span>
              <span className={`font-bold ${
                effectiveLiText.length > 3000
                  ? 'text-[#f9665f]'
                  : 'text-[#ff6a91]'
              }`}>
                {effectiveLiText.length}/3000
              </span>
            </span>

            <span className="flex items-center gap-1.5 font-mono">
              <span className="font-display font-bold text-[#111116]">Instagram:</span>
              <span className={`font-bold ${
                effectiveIgText.length > 2200
                  ? 'text-[#f9665f]'
                  : 'text-[#dc2743]'
              }`}>
                {effectiveIgText.length}/2200
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!customOverrides) {
                setXContent(content);
                setLinkedinContent(content);
                setInstagramContent(content);
              }
              setCustomOverrides(!customOverrides);
            }}
            className="text-xs text-[#111116] hover:text-[#6a6afe] flex items-center gap-1.5 transition-colors font-display font-bold cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#ff6a91]" />
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
        <div className="bg-[#fef7e6] border-2 border-[#111116] rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-[2px_2px_0px_#111116]">
          <div className="flex items-center gap-2 text-[#111116]">
            <Clock className="w-4 h-4 text-[#6a6afe]" />
            <span className="font-display font-bold">Scheduled Broadcast Cadence:</span>
          </div>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="bg-white border-2 border-[#111116] rounded-xl px-3 py-1.5 text-[#111116] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#6a6afe]"
          />
        </div>
      )}

      {/* Feedback Alert */}
      {statusMessage && (
        <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 border-2 border-[#111116] shadow-[2px_2px_0px_#111116] ${
          statusMessage.type === 'error'
            ? 'bg-[#ffebee] text-[#b71c1c]'
            : 'bg-[#e8f8f0] text-[#1b5e20]'
        }`}>
          {statusMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#f9665f]" />
          ) : (
            <Check className="w-4 h-4 shrink-0 text-[#2e7d32]" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t-2 border-[#111116]/10">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsScheduling(!isScheduling)}
            className={`px-4 py-2 rounded-full text-xs font-display font-bold border-2 border-[#111116] flex items-center gap-2 transition-all cursor-pointer ${
              isScheduling
                ? 'bg-[#ffe400] text-[#111116] shadow-[2px_2px_0px_#111116]'
                : 'bg-white text-[#111116] hover:bg-[#fef7e6]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isScheduling ? 'Schedule Active' : 'Schedule'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-full text-xs font-display font-bold bg-white border-2 border-[#111116] text-[#111116] hover:bg-[#fef7e6] transition-all disabled:opacity-40 cursor-pointer shadow-[2px_2px_0px_#111116]"
          >
            Save Draft
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit(isScheduling ? false : true)}
          disabled={
            isSubmitting || 
            (effectiveXText.length > 280 && targetPlatforms.includes('x')) ||
            (effectiveIgText.length > 2200 && targetPlatforms.includes('instagram')) ||
            (targetPlatforms.includes('instagram') && mediaUrls.length === 0)
          }
          className={`px-7 py-2.5 rounded-full text-xs font-display font-black flex items-center gap-2 transition-all cursor-pointer border-2 border-[#111116] ${
            isScheduling
              ? 'bg-[#ffe400] text-[#111116] shadow-[3px_3px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
              : 'bg-[#6a6afe] text-white shadow-[3px_3px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {isScheduling ? (
            <>
              <Clock className="w-4 h-4 text-[#111116]" />
              <span>{isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Dispatching...' : 'Publish Broadcast'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
