import React, { useState, useEffect } from 'react';
import {
  Send,
  Calendar,
  History,
  Settings,
  RefreshCw,
  Sparkles,
  Zap,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Layers,
  MessageSquare
} from 'lucide-react';
import Composer from './components/Composer';
import XPreview from './components/XPreview';
import LinkedInPreview from './components/LinkedInPreview';
import InstagramPreview from './components/InstagramPreview';
import ScheduledQueue from './components/ScheduledQueue';
import PostHistory from './components/PostHistory';
import SettingsModal from './components/SettingsModal';
import { getPosts, getHealth, getSettings } from './api/client';

export default function App() {
  const [activeView, setActiveView] = useState('studio'); // 'studio' | 'queue' | 'history'
  const [previewTab, setPreviewTab] = useState('x'); // 'x' | 'linkedin' | 'instagram' | 'both'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Data state
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [engineHealth, setEngineHealth] = useState(null);
  const [settingsData, setSettingsData] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  // Live draft preview state
  const [livePreviewText, setLivePreviewText] = useState(null);
  const [liveMediaUrls, setLiveMediaUrls] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingPosts(true);
    try {
      const [postsRes, healthRes, settingsRes] = await Promise.all([
        getPosts(),
        getHealth().catch(() => null),
        getSettings().catch(() => null),
      ]);
      setPosts(postsRes || []);
      setEngineHealth(healthRes);
      setSettingsData(settingsRes);
    } catch (err) {
      console.error('Initial data fetch error:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setEditingPost(null);
    fetchInitialData();
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setActiveView('studio');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const scheduledCount = posts.filter(p => p.status === 'SCHEDULED').length;

  return (
    <div className="min-h-screen bg-[#fef7e6] text-[#111116] flex flex-col font-sans selection:bg-[#6a6afe] selection:text-white relative overflow-x-hidden">
      
      {/* ── TOP HEADER / NAVIGATION ── */}
      <header className="sticky top-0 z-50 bg-[#fef7e6]/90 backdrop-blur-md border-b-2 border-[#111116] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <a href="#" className="flex items-center gap-2.5 group">
            <span className="w-9 h-9 rounded-full bg-[#6a6afe] border-2 border-[#111116] flex items-center justify-center text-white font-display font-black text-lg shadow-[2px_2px_0px_#111116] group-hover:rotate-6 transition-transform">
              P
            </span>
            <div className="flex flex-col">
              <span className="font-display font-black text-2xl tracking-tight text-[#111116] leading-none">
                Pulse<span className="text-[#ff6a91]">.</span>
              </span>
              <span className="text-[10px] font-bold text-[#111116]/60 uppercase tracking-widest leading-tight">
                Media Automation Studio
              </span>
            </div>
          </a>
        </div>

        {/* Floating Center Pill Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-white border-2 border-[#111116] px-2.5 py-1.5 rounded-full shadow-[3px_3px_0px_#111116]">
          <button
            onClick={() => setActiveView('studio')}
            className={`px-4 py-1.5 rounded-full text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === 'studio'
                ? 'bg-[#6a6afe] text-white shadow-[2px_2px_0px_#111116]'
                : 'text-[#111116] hover:bg-[#fef7e6]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeView === 'studio' ? 'bg-white' : 'bg-[#6a6afe]'}`} />
            <span>Studio Composer</span>
          </button>

          <button
            onClick={() => setActiveView('queue')}
            className={`px-4 py-1.5 rounded-full text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === 'queue'
                ? 'bg-[#ff6a91] text-white shadow-[2px_2px_0px_#111116]'
                : 'text-[#111116] hover:bg-[#fef7e6]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeView === 'queue' ? 'bg-white' : 'bg-[#ff6a91]'}`} />
            <span>Scheduled Queue</span>
            {scheduledCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${activeView === 'queue' ? 'bg-white text-[#ff6a91]' : 'bg-[#ff6a91] text-white'}`}>
                {scheduledCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('history')}
            className={`px-4 py-1.5 rounded-full text-xs font-display font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === 'history'
                ? 'bg-[#6CEBB0] text-[#111116] shadow-[2px_2px_0px_#111116]'
                : 'text-[#111116] hover:bg-[#fef7e6]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activeView === 'history' ? 'bg-[#111116]' : 'bg-[#6CEBB0]'}`} />
            <span>Published Feed & Engagement</span>
          </button>
        </nav>

        {/* Action Controls & Gateways Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchInitialData}
            className="w-9 h-9 rounded-full bg-white border-2 border-[#111116] flex items-center justify-center text-[#111116] hover:bg-[#ffe400] shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
            title="Refresh engine data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPosts ? 'animate-spin text-[#6a6afe]' : ''}`} />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-1.5 rounded-full bg-[#ffe400] text-[#111116] border-2 border-[#111116] font-display font-bold text-xs shadow-[2px_2px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Channel Settings</span>
          </button>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section className="relative pt-12 pb-14 sm:pt-16 sm:pb-20 text-center max-w-5xl mx-auto px-6 overflow-visible">
        
        {/* Refined Professional Capability Pills */}
        <div className="hidden sm:inline-flex absolute top-6 left-2 sm:left-4 rotate-[-3deg] neo-pill bg-[#ffe400] text-[#111116]">
          <span>Multi-Channel Distribution</span>
        </div>

        <div className="hidden sm:inline-flex absolute top-8 right-2 sm:right-6 rotate-[2.5deg] neo-pill bg-[#6CEBB0] text-[#111116]">
          <span>Intelligent Content Adaptation</span>
        </div>

        <div className="hidden md:inline-flex absolute bottom-8 left-12 rotate-[2deg] neo-pill bg-[#ff6a91] text-white">
          <span>Unified Reply Stream</span>
        </div>

        <div className="hidden md:inline-flex absolute bottom-10 right-14 rotate-[-2.5deg] neo-pill bg-[#6a6afe] text-white">
          <span>Real-Time Performance Metrics</span>
        </div>

        {/* Small Editorial Category Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-2 border-[#111116] bg-white text-xs font-display font-bold text-[#111116] mb-5 shadow-[2px_2px_0px_#111116]">
          <span className="w-2 h-2 rounded-full bg-[#6a6afe]" />
          <span>Unified Social Publishing Engine</span>
        </div>

        {/* Monumental Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight leading-[1.05] mb-5 text-[#111116]">
          Publish with precision.{' '}
          <span className="bg-[#ff6a91] text-white px-3 sm:px-4 py-0.5 rounded-2xl rotate-[-1deg] inline-block shadow-[4px_4px_0px_#111116]">
            Engage in real-time.
          </span>
        </h1>

        {/* Professional Subtitle */}
        <p className="text-[#111116]/80 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
          Coordinate content across your publishing channels from a single workbench. Craft tailored variations, preview authentic feeds, schedule campaigns, and respond to audience threads in real time.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3.5 flex-wrap">
          <button
            onClick={() => {
              setActiveView('studio');
              window.scrollTo({ top: 480, behavior: 'smooth' });
            }}
            className="px-7 py-3 rounded-full bg-[#6a6afe] text-white border-2 border-[#111116] font-display font-bold text-sm shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
          >
            Open Studio Composer
          </button>

          <button
            onClick={() => setActiveView('queue')}
            className="px-7 py-3 rounded-full bg-white text-[#111116] border-2 border-[#111116] font-display font-bold text-sm shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
          >
            Scheduled Queue ({scheduledCount})
          </button>

          <button
            onClick={() => setActiveView('history')}
            className="px-7 py-3 rounded-full bg-[#6CEBB0] text-[#111116] border-2 border-[#111116] font-display font-bold text-sm shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
          >
            Engagement Stream
          </button>
        </div>
      </section>

      {/* ── ORGANIC WAVE SCOOP DIVIDER ── */}
      <div className="w-full relative leading-none -mb-[1px]">
        <svg className="doooing-wave w-full h-12 sm:h-16" viewBox="0 0 1440 50" preserveAspectRatio="none">
          <path d="M0,0 C480,50 960,50 1440,0 L1440,50 L0,50 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* ── MAIN WORKSPACE SECTION ── */}
      <section className="bg-white border-b-2 border-[#111116] flex-1 py-10 sm:py-14 relative z-10">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Mobile Tab Navigation */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-8 flex-wrap">
            <button
              onClick={() => setActiveView('studio')}
              className={`px-4 py-2 rounded-full text-xs font-display font-bold border-2 border-[#111116] ${
                activeView === 'studio' ? 'bg-[#6a6afe] text-white shadow-[2px_2px_0px_#111116]' : 'bg-white'
              }`}
            >
              Composer
            </button>
            <button
              onClick={() => setActiveView('queue')}
              className={`px-4 py-2 rounded-full text-xs font-display font-bold border-2 border-[#111116] ${
                activeView === 'queue' ? 'bg-[#ff6a91] text-white shadow-[2px_2px_0px_#111116]' : 'bg-white'
              }`}
            >
              Queue ({scheduledCount})
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-4 py-2 rounded-full text-xs font-display font-bold border-2 border-[#111116] ${
                activeView === 'history' ? 'bg-[#6CEBB0] text-[#111116] shadow-[2px_2px_0px_#111116]' : 'bg-white'
              }`}
            >
              Feed & Engagement
            </button>
          </div>

          {/* STUDIO VIEW */}
          {activeView === 'studio' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Studio Composer */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-[#111116] flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#6a6afe] border-1.5 border-[#111116]" />
                      <span>{editingPost ? 'Edit Campaign Draft' : 'Compose & Distribute'}</span>
                    </h2>
                    <p className="text-xs text-[#111116]/70 font-medium">
                      Author your message, adapt for destination channels, and coordinate publication.
                    </p>
                  </div>

                  {editingPost && (
                    <button
                      onClick={() => setEditingPost(null)}
                      className="px-3 py-1 rounded-full bg-[#ffe400] text-[#111116] border-2 border-[#111116] text-xs font-display font-bold shadow-[2px_2px_0px_#111116] cursor-pointer"
                    >
                      Clear Edit
                    </button>
                  )}
                </div>

                <Composer
                  onPostCreated={handlePostCreated}
                  selectedPostToEdit={editingPost}
                  onDraftChange={(draft) => {
                    setLivePreviewText(draft);
                    setLiveMediaUrls(draft.mediaUrls || []);
                  }}
                />
              </div>

              {/* Right Column: Live Feed Simulator */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="flex items-center justify-between pb-1 border-b-2 border-[#111116]/10">
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[#111116] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#6a6afe]" />
                    Channel Simulation
                  </span>

                  {/* Switcher Pills */}
                  <div className="flex items-center gap-1 bg-[#fef7e6] border-2 border-[#111116] p-1 rounded-full text-xs font-display font-bold shadow-[2px_2px_0px_#111116] flex-wrap">
                    <button
                      onClick={() => setPreviewTab('x')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        previewTab === 'x'
                          ? 'bg-[#111116] text-white shadow-sm'
                          : 'text-[#111116] hover:bg-white'
                      }`}
                    >
                      X (Twitter)
                    </button>
                    <button
                      onClick={() => setPreviewTab('linkedin')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        previewTab === 'linkedin'
                          ? 'bg-[#6a6afe] text-white shadow-sm'
                          : 'text-[#111116] hover:bg-white'
                      }`}
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => setPreviewTab('instagram')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        previewTab === 'instagram'
                          ? 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm'
                          : 'text-[#111116] hover:bg-white'
                      }`}
                    >
                      Instagram
                    </button>
                    <button
                      onClick={() => setPreviewTab('both')}
                      className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                        previewTab === 'both'
                          ? 'bg-[#ff6a91] text-white shadow-sm'
                          : 'text-[#111116] hover:bg-white'
                      }`}
                    >
                      All Channels
                    </button>
                  </div>
                </div>

                {/* Simulator Previews Container */}
                <div className="space-y-4">
                  {(previewTab === 'x' || previewTab === 'both') && (
                    <div className="neo-box border-2 border-[#111116] p-4 bg-[#fbf6ea] shadow-[4px_4px_0px_#111116]">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-[#111116]/10">
                        <span className="text-xs font-display font-bold text-[#111116] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#111116]" />
                          Feed Simulation (Short-Form)
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#111116]/60">
                          {livePreviewText?.xContent?.length || livePreviewText?.content?.length || 0}/280
                        </span>
                      </div>
                      <XPreview
                        text={livePreviewText?.xContent || livePreviewText?.content || editingPost?.x_content || editingPost?.content || ''}
                        mediaUrls={liveMediaUrls.length > 0 ? liveMediaUrls : (editingPost?.media_urls || [])}
                        charValidation={true}
                      />
                    </div>
                  )}

                  {(previewTab === 'linkedin' || previewTab === 'both') && (
                    <div className="neo-box border-2 border-[#111116] p-4 bg-[#fbf6ea] shadow-[4px_4px_0px_#111116]">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-[#111116]/10">
                        <span className="text-xs font-display font-bold text-[#6a6afe] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#6a6afe]" />
                          Feed Simulation (Long-Form)
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#111116]/60">
                          {livePreviewText?.linkedinContent?.length || livePreviewText?.content?.length || 0}/3000
                        </span>
                      </div>
                      <LinkedInPreview
                        text={livePreviewText?.linkedinContent || livePreviewText?.content || editingPost?.linkedin_content || editingPost?.content || ''}
                        mediaUrls={liveMediaUrls.length > 0 ? liveMediaUrls : (editingPost?.media_urls || [])}
                      />
                    </div>
                  )}

                  {(previewTab === 'instagram' || previewTab === 'both') && (
                    <div className="neo-box border-2 border-[#111116] p-4 bg-[#fbf6ea] shadow-[4px_4px_0px_#111116]">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-[#111116]/10">
                        <span className="text-xs font-display font-bold text-[#dc2743] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#dc2743]" />
                          Feed Simulation (Visual & Storytelling)
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#111116]/60">
                          {livePreviewText?.instagramContent?.length || livePreviewText?.content?.length || 0}/2200
                        </span>
                      </div>
                      <InstagramPreview
                        text={livePreviewText?.instagramContent || livePreviewText?.content || editingPost?.instagram_content || editingPost?.content || ''}
                        mediaUrls={liveMediaUrls.length > 0 ? liveMediaUrls : (editingPost?.media_urls || [])}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* QUEUE VIEW */}
          {activeView === 'queue' && (
            <ScheduledQueue
              posts={posts}
              onRefresh={fetchInitialData}
              onEditPost={handleEditPost}
            />
          )}

          {/* FEED & ENGAGEMENT VIEW */}
          {activeView === 'history' && (
            <PostHistory
              posts={posts}
              onRefresh={fetchInitialData}
            />
          )}

        </div>
      </section>

      {/* ── ORGANIC WAVE SCOOP DIVIDER ── */}
      <div className="w-full relative leading-none -mb-[1px]">
        <svg className="doooing-wave w-full h-12 sm:h-16" viewBox="0 0 1440 50" preserveAspectRatio="none">
          <path d="M0,0 C480,50 960,50 1440,0 L1440,50 L0,50 Z" fill="#ff6a91" />
        </svg>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#ff6a91] text-white pt-10 pb-12 px-6 sm:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          
          {/* Main CTA */}
          <div className="text-center py-6">
            <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-white mb-4">
              Scale your communication across every channel.
            </h2>
            <p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto mb-6 font-medium">
              Centralized authoring, intelligent channel adaptation, and direct real-time thread interactions.
            </p>
            <button
              onClick={() => {
                setActiveView('studio');
                window.scrollTo({ top: 380, behavior: 'smooth' });
              }}
              className="px-8 py-3 rounded-full bg-[#ffe400] text-[#111116] border-2 border-[#111116] font-display font-black text-sm shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
            >
              Compose Broadcast
            </button>
          </div>

          {/* Footer Navigation Columns */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t-2 border-white/20 text-xs font-display font-bold">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#ffe400] text-[#111116] border-2 border-[#111116] flex items-center justify-center font-black">
                P
              </span>
              <span className="text-base tracking-tight text-white">Social Pulse Studio</span>
            </div>

            <div className="flex items-center gap-6 flex-wrap justify-center">
              <button onClick={() => setActiveView('studio')} className="hover:text-[#ffe400] transition-colors cursor-pointer">
                Studio Composer
              </button>
              <button onClick={() => setActiveView('queue')} className="hover:text-[#ffe400] transition-colors cursor-pointer">
                Scheduled Queue
              </button>
              <button onClick={() => setActiveView('history')} className="hover:text-[#ffe400] transition-colors cursor-pointer">
                Published Feed
              </button>
              <button onClick={() => setIsSettingsOpen(true)} className="hover:text-[#ffe400] transition-colors cursor-pointer">
                Channel Gateways
              </button>
            </div>

            <div className="text-white/80 font-normal font-sans text-xs">
              © 2026 Pulse Studio Enterprise
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          fetchInitialData();
        }}
      />
    </div>
  );
}
