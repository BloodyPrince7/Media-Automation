import React, { useState, useEffect } from 'react';
import {
  Send,
  Calendar,
  History,
  Settings,
  RefreshCw,
  Sparkles,
  Zap,
  Globe,
  Sliders,
  ChevronRight
} from 'lucide-react';
import Composer from './components/Composer';
import XPreview from './components/XPreview';
import LinkedInPreview from './components/LinkedInPreview';
import ScheduledQueue from './components/ScheduledQueue';
import PostHistory from './components/PostHistory';
import SettingsModal from './components/SettingsModal';
import { getPosts, getHealth, getSettings } from './api/client';
import heroIllustration from './assets/hero.png';

export default function App() {
  const [activeView, setActiveView] = useState('studio'); // 'studio' | 'queue' | 'history'
  const [previewTab, setPreviewTab] = useState('x'); // 'x' | 'linkedin' | 'both'
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
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030305] text-neutral-100 flex flex-col font-sans selection:bg-[#ff3b8f]/30 selection:text-white relative overflow-x-hidden">
      {/* Ambient Floating Glowing Orbs (matching reference concept) */}
      <div className="absolute top-28 left-6 sm:left-24 w-6 h-6 rounded-full bg-[#a855f7] shadow-[0_0_30px_10px_rgba(168,85,247,0.7)] pointer-events-none opacity-80" />
      <div className="absolute top-44 right-8 sm:right-32 w-10 h-10 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#00f2fe] shadow-[0_0_40px_12px_rgba(0,242,254,0.6)] pointer-events-none opacity-80" />
      <div className="absolute top-80 right-16 w-3 h-3 rounded-full bg-[#ff3b8f] shadow-[0_0_20px_6px_rgba(255,59,143,0.8)] pointer-events-none" />

      {/* Minimalist Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#030305]/80 backdrop-blur-xl border-b border-white/[0.05] px-6 sm:px-12 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#ff3b8f] to-[#00f2fe] shadow-[0_0_10px_rgba(255,59,143,0.8)]" />
            Pulse Studio
          </span>
        </div>

        {/* Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-400">
          <button
            onClick={() => setActiveView('studio')}
            className={`transition-colors hover:text-white ${activeView === 'studio' ? 'text-white font-semibold' : ''}`}
          >
            Studio Composer
          </button>
          <button
            onClick={() => setActiveView('queue')}
            className={`transition-colors hover:text-white flex items-center gap-1.5 ${activeView === 'queue' ? 'text-white font-semibold' : ''}`}
          >
            <span>Scheduled Queue</span>
            {posts.filter(p => p.status === 'SCHEDULED').length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] shadow-[0_0_8px_#00f2fe]" />
            )}
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`transition-colors hover:text-white ${activeView === 'history' ? 'text-white font-semibold' : ''}`}
          >
            Audit History
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="transition-colors hover:text-white"
          >
            Gateways
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchInitialData}
            className="p-2 rounded-full hover:bg-white/[0.06] text-neutral-400 hover:text-white transition-colors"
            title="Refresh engine data"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPosts ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-1.5 rounded-full border border-neutral-700/80 hover:border-neutral-500 bg-white/[0.02] text-xs font-semibold text-neutral-200 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-[#ff3b8f]" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Hero Showcase Section (Directly inspired by reference layout) */}
      <section className="relative px-6 pt-12 pb-10 sm:pt-16 sm:pb-14 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#ff3b8f]/40 bg-[#ff3b8f]/10 text-xs font-semibold text-pink-300 mb-6 shadow-[0_0_20px_rgba(255,59,143,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-[#ff3b8f]" />
          <span>Multi-Platform Media Automation</span>
        </div>

        {/* Headline matching user's reference image typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-5">
          <span className="bg-gradient-to-r from-[#ff3b8f] via-[#c084fc] to-[#00f2fe] bg-clip-text text-transparent">
            Automated Media.
          </span>
          <br />
          <span className="text-white">Scalable Distribution.</span>
        </h1>

        {/* Description */}
        <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
          Intelligent cross-network publishing engine connecting X (Twitter) and LinkedIn with authentic real-time feed simulation, scheduling queues, and asset adaptation.
        </p>

        {/* Pill Action Buttons (matching reference image) */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => {
              setActiveView('studio');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="px-7 py-2.5 rounded-full border border-[#ff3b8f] bg-gradient-to-r from-[#ff3b8f]/20 via-[#a855f7]/20 to-[#00f2fe]/20 hover:from-[#ff3b8f]/35 hover:to-[#00f2fe]/35 text-white font-semibold text-xs sm:text-sm shadow-[0_0_25px_rgba(255,59,143,0.35)] transition-all cursor-pointer"
          >
            Get Started
          </button>

          <button
            onClick={() => setActiveView('queue')}
            className="px-7 py-2.5 rounded-full border border-neutral-700 hover:border-neutral-500 bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            View Queue ({posts.filter(p => p.status === 'SCHEDULED').length})
          </button>
        </div>
      </section>

      {/* Main Studio Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        {activeView === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Studio Composer Card */}
            <div className="lg:col-span-7">
              <div className="mb-3.5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff3b8f]" />
                    <span>{editingPost ? 'Edit Post' : 'Compose & Distribute'}</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Craft your message, adjust platform specifics, and launch.
                  </p>
                </div>

                {editingPost && (
                  <button
                    onClick={() => setEditingPost(null)}
                    className="text-xs text-[#ff3b8f] hover:underline font-semibold"
                  >
                    Clear editing
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

            {/* Right: Live Feed Simulator */}
            <div className="lg:col-span-5 flex flex-col gap-3.5">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-bold bg-gradient-to-r from-[#00f2fe] to-[#ff3b8f] bg-clip-text text-transparent flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" />
                  Live Authentic Simulator
                </span>

                <div className="flex items-center gap-1 bg-[#0c0d15] border border-white/[0.08] p-1 rounded-full text-xs font-medium">
                  <button
                    onClick={() => setPreviewTab('x')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      previewTab === 'x'
                        ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/40 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    X (Twitter)
                  </button>
                  <button
                    onClick={() => setPreviewTab('linkedin')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      previewTab === 'linkedin'
                        ? 'bg-blue-600/25 text-blue-300 font-semibold border border-blue-400/40 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    LinkedIn
                  </button>
                  <button
                    onClick={() => setPreviewTab('both')}
                    className={`px-3 py-1 rounded-full transition-all ${
                      previewTab === 'both'
                        ? 'bg-gradient-to-r from-[#ff3b8f]/30 to-[#00f2fe]/30 text-white font-semibold border border-white/20 shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Stacked
                  </button>
                </div>
              </div>

              {/* Previews Container */}
              <div className="space-y-4">
                {(previewTab === 'x' || previewTab === 'both') && (
                  <div className="transition-all duration-200">
                    <XPreview
                      text={livePreviewText?.xContent || livePreviewText?.content || editingPost?.x_content || editingPost?.content || ''}
                      mediaUrls={liveMediaUrls.length > 0 ? liveMediaUrls : (editingPost?.media_urls || [])}
                      charValidation={true}
                    />
                  </div>
                )}

                {(previewTab === 'linkedin' || previewTab === 'both') && (
                  <div className="transition-all duration-200">
                    <LinkedInPreview
                      text={livePreviewText?.linkedinContent || livePreviewText?.content || editingPost?.linkedin_content || editingPost?.content || ''}
                      mediaUrls={liveMediaUrls.length > 0 ? liveMediaUrls : (editingPost?.media_urls || [])}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeView === 'queue' && (
          <ScheduledQueue
            posts={posts}
            onRefresh={fetchInitialData}
            onEditPost={handleEditPost}
          />
        )}

        {activeView === 'history' && (
          <PostHistory
            posts={posts}
            onRefresh={fetchInitialData}
          />
        )}
      </main>

      {/* Bottom Cybernetic Art Banner (matching uploaded image aesthetic) */}
      <footer className="mt-auto border-t border-white/[0.06] bg-[#030305]/90 pt-8 pb-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f2fe]" />
            <span className="font-semibold text-neutral-300">Social Pulse Studio</span>
            <span>• Direct API Distribution</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-neutral-300 transition-colors">
              API Gateways
            </button>
            <button onClick={() => setActiveView('queue')} className="hover:text-neutral-300 transition-colors">
              Schedule Queue
            </button>
            <button onClick={() => setActiveView('history')} className="hover:text-neutral-300 transition-colors">
              Audit Logs
            </button>
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
