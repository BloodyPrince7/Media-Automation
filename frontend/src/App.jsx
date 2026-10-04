import React, { useState, useEffect } from 'react';
import {
  Share2,
  Calendar,
  History,
  Settings,
  RefreshCw,
  Sliders,
  Send,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Composer from './components/Composer';
import XPreview from './components/XPreview';
import LinkedInPreview from './components/LinkedInPreview';
import ScheduledQueue from './components/ScheduledQueue';
import PostHistory from './components/PostHistory';
import SettingsModal from './components/SettingsModal';
import { getPosts, getHealth, getSettings } from './api/client';

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
  const [livePreviewText, setLivePreviewText] = useState('');
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
  };

  return (
    <div className="min-h-screen bg-[#0a0b10] text-neutral-100 flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0e1017]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-neutral-600/40 flex items-center justify-center shadow-md">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">Social Pulse Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Automated multi-platform broadcast engine for X & LinkedIn
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveView('studio')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeView === 'studio'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Studio Composer</span>
          </button>
          <button
            onClick={() => setActiveView('queue')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeView === 'queue'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Scheduled Queue</span>
            {posts.filter(p => p.status === 'SCHEDULED').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeView === 'history'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
        </div>

        {/* System Status & Settings Action */}
        <div className="flex items-center gap-2.5">
          {/* Engine indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${engineHealth ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
            <span className="text-neutral-300">
              {settingsData?.mock_mode ? 'Simulation Mode' : 'Live Gateway'}
            </span>
          </div>

          <button
            onClick={fetchInitialData}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Refresh engine state"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPosts ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Credentials</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-b border-neutral-800 bg-[#0e1017] px-2 py-2 text-xs">
        <button
          onClick={() => setActiveView('studio')}
          className={`px-3 py-1.5 rounded-lg ${activeView === 'studio' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
        >
          Studio
        </button>
        <button
          onClick={() => setActiveView('queue')}
          className={`px-3 py-1.5 rounded-lg ${activeView === 'queue' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
        >
          Queue ({posts.filter(p => p.status === 'SCHEDULED').length})
        </button>
        <button
          onClick={() => setActiveView('history')}
          className={`px-3 py-1.5 rounded-lg ${activeView === 'history' ? 'bg-neutral-800 text-white' : 'text-neutral-400'}`}
        >
          History
        </button>
      </div>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Composer Workspace */}
            <div className="lg:col-span-7">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h1 className="text-base font-semibold text-white tracking-tight">
                    {editingPost ? 'Edit Post' : 'Post Studio & Distribution'}
                  </h1>
                  <p className="text-xs text-neutral-400">
                    Compose once, calibrate for each network, preview live, and broadcast.
                  </p>
                </div>

                {editingPost && (
                  <button
                    onClick={() => setEditingPost(null)}
                    className="text-xs text-neutral-400 hover:text-neutral-200 underline"
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

            {/* Right: Real-time Platform Feed Simulators */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  Live Network Preview
                </span>

                <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setPreviewTab('x')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'x' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    X (Twitter)
                  </button>
                  <button
                    onClick={() => setPreviewTab('linkedin')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'linkedin' ? 'bg-neutral-800 text-[#70b5f8] font-medium' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    LinkedIn
                  </button>
                  <button
                    onClick={() => setPreviewTab('both')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'both' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Side-by-side
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
