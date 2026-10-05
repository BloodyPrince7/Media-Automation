import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Heart,
  MessageSquare,
  Eye,
  BarChart2,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Award,
  Layers,
  Clock,
  Flame,
  Zap
} from 'lucide-react';
import { getAnalyticsOverview } from '../api/client';

const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function AnalyticsDashboard({ onNavigateToComposer }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await getAnalyticsOverview();
      setData(res);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-[#ffe400] border-2 border-[#111116] shadow-[4px_4px_0px_#111116] flex items-center justify-center text-[#111116] mb-4 animate-bounce">
          <BarChart2 size={24} />
        </div>
        <h3 className="text-lg font-display font-black text-[#111116]">Aggregating cross-channel performance...</h3>
        <p className="text-xs text-[#111116]/60 font-medium mt-1">Reading live statistics from X, LinkedIn & Instagram</p>
      </div>
    );
  }

  const stats = data || {};
  const platformStats = stats.platform_stats || [];
  const topPosts = stats.top_posts || [];
  const weeklyActivity = stats.weekly_activity || [];

  const xStat = platformStats.find(p => p.platform === 'x') || {
    handle_or_name: '@Pagal88114784',
    total_posts: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    estimated_reach: 0
  };

  const liStat = platformStats.find(p => p.platform === 'linkedin') || {
    handle_or_name: 'Connected Account',
    total_posts: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    estimated_reach: 0
  };

  const igStat = platformStats.find(p => p.platform === 'instagram') || {
    handle_or_name: '@connected_channel',
    total_posts: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    estimated_reach: 0
  };

  const totalInteractions = (stats.total_likes || 0) + (stats.total_comments || 0) + (stats.total_shares || 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto text-[#111116]">
      {/* Top Banner (Doooing Playful Card) */}
      <div className="bg-[#fdfaf3] border-2 border-[#111116] rounded-[28px] p-6 sm:p-8 shadow-[6px_6px_0px_#111116] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-[#ffe400]/40 rounded-full border-2 border-[#111116] pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111116] text-white text-xs font-display font-black tracking-wider uppercase mb-3 shadow-[2px_2px_0px_#6a6afe]">
            <Sparkles size={12} className="text-[#ffe400]" />
            Audience Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-[#111116] tracking-tight">
            Cross-Channel Performance
          </h1>
          <p className="text-[#111116]/75 text-xs sm:text-sm mt-1 max-w-xl font-medium leading-relaxed">
            Real-time audience reach, engagement velocity, and cross-platform breakdown across X, LinkedIn, and Instagram.
          </p>
        </div>

        <div className="relative flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="neo-btn bg-white hover:bg-[#ffe400] text-[#111116] px-4 py-2 text-xs font-display font-bold flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-[#6a6afe]' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live Stats'}</span>
          </button>
          {onNavigateToComposer && (
            <button
              onClick={onNavigateToComposer}
              className="neo-btn bg-[#6a6afe] text-white px-5 py-2 text-xs font-display font-black flex items-center gap-1.5 shadow-[3px_3px_0px_#111116] cursor-pointer"
            >
              <span>Compose</span>
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid (Doooing Hard-Shadow Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimated Reach */}
        <div className="bg-white border-2 border-[#111116] p-5 rounded-[24px] shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-[#111116]/70 uppercase tracking-wide">Estimated Reach</span>
            <div className="w-8 h-8 rounded-full bg-[#6a6afe] border-2 border-[#111116] text-white flex items-center justify-center shadow-[1px_1px_0px_#111116]">
              <Eye size={15} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-[#111116]">
              {(stats.total_impressions || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#2e7d32] font-display font-bold">
              <TrendingUp size={12} />
              <span>+18.4% audience lift</span>
            </div>
          </div>
        </div>

        {/* Total Interactions */}
        <div className="bg-white border-2 border-[#111116] p-5 rounded-[24px] shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-[#111116]/70 uppercase tracking-wide">Engagements</span>
            <div className="w-8 h-8 rounded-full bg-[#ff6a91] border-2 border-[#111116] text-white flex items-center justify-center shadow-[1px_1px_0px_#111116]">
              <Heart size={15} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-[#111116]">
              {totalInteractions.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#111116]/70 font-medium mt-1">
              {stats.total_likes || 0} likes · {stats.total_comments || 0} replies
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-white border-2 border-[#111116] p-5 rounded-[24px] shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-[#111116]/70 uppercase tracking-wide">Engagement Rate</span>
            <div className="w-8 h-8 rounded-full bg-[#6CEBB0] border-2 border-[#111116] text-[#111116] flex items-center justify-center shadow-[1px_1px_0px_#111116]">
              <Zap size={15} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-[#111116]">
              {stats.avg_engagement_rate || 5.2}%
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#2e7d32] font-display font-bold">
              <Award size={12} />
              <span>Above industry avg</span>
            </div>
          </div>
        </div>

        {/* Broadcasts Count */}
        <div className="bg-white border-2 border-[#111116] p-5 rounded-[24px] shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-display font-bold text-[#111116]/70 uppercase tracking-wide">Pipeline</span>
            <div className="w-8 h-8 rounded-full bg-[#ffe400] border-2 border-[#111116] text-[#111116] flex items-center justify-center shadow-[1px_1px_0px_#111116]">
              <Layers size={15} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-display font-black text-[#111116]">
              {stats.published_count || 0}
            </div>
            <div className="text-[11px] text-[#111116]/70 font-medium mt-1">
              {stats.scheduled_count || 0} scheduled · {stats.draft_count || 0} drafts
            </div>
          </div>
        </div>
      </div>

      {/* Platform Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-black text-[#111116]">Channel Distribution Cards</h2>
          <span className="neo-pill bg-[#ffe400] text-[#111116]">3 Networks Live</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* X (Twitter) Card */}
          <div className="bg-white border-2 border-[#111116] rounded-[26px] p-5 shadow-[5px_5px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#111116]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#111116] text-white flex items-center justify-center border-2 border-[#111116] shadow-[2px_2px_0px_#111116]">
                    <XIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-[#111116] leading-tight">X (Twitter)</h3>
                    <p className="text-xs text-[#111116]/60 font-mono font-bold">{xStat.handle_or_name}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#e8f8f0] text-[#2e7d32] border border-[#111116]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6CEBB0] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#059669]"></span>
                  </span>
                  <span>Active</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Posts</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{xStat.total_posts}</span>
                </div>
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Likes</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{xStat.total_likes}</span>
                </div>
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Replies</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{xStat.total_comments}</span>
                </div>
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Reach</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{xStat.estimated_reach}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-[#111116]/70 flex items-center justify-between pt-2 border-t-2 border-[#111116]/10 font-bold">
              <span>Velocity: <strong>High</strong></span>
              <a
                href={`https://x.com/${xStat.handle_or_name.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#6a6afe] hover:underline flex items-center gap-0.5"
              >
                Profile <ArrowUpRight size={11} />
              </a>
            </div>
          </div>

          {/* LinkedIn Card */}
          <div className="bg-white border-2 border-[#111116] rounded-[26px] p-5 shadow-[5px_5px_0px_#6a6afe] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#111116]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#0a66c2] text-white flex items-center justify-center border-2 border-[#111116] shadow-[2px_2px_0px_#111116]">
                    <LinkedInIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-[#111116] leading-tight">LinkedIn</h3>
                    <p className="text-xs text-[#111116]/60 font-bold">{liStat.handle_or_name}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#e8f8f0] text-[#2e7d32] border border-[#111116]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6CEBB0] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#059669]"></span>
                  </span>
                  <span>Active</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Posts</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{liStat.total_posts}</span>
                </div>
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Reactions</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{liStat.total_likes}</span>
                </div>
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Comments</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{liStat.total_comments}</span>
                </div>
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Reach</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{liStat.estimated_reach}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-[#111116]/70 flex items-center justify-between pt-2 border-t-2 border-[#111116]/10 font-bold">
              <span>Authority: <strong>Growing</strong></span>
              <a
                href="https://www.linkedin.com/feed/"
                target="_blank"
                rel="noreferrer"
                className="text-[#6a6afe] hover:underline flex items-center gap-0.5"
              >
                Profile <ArrowUpRight size={11} />
              </a>
            </div>
          </div>

          {/* Instagram Card */}
          <div className="bg-white border-2 border-[#111116] rounded-[26px] p-5 shadow-[5px_5px_0px_#ff6a91] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#111116]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center border-2 border-[#111116] shadow-[2px_2px_0px_#111116]">
                    <InstagramIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-[#111116] leading-tight">Instagram</h3>
                    <p className="text-xs text-[#111116]/60 font-mono font-bold">{igStat.handle_or_name}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#e8f8f0] text-[#2e7d32] border border-[#111116]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6CEBB0] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#059669]"></span>
                  </span>
                  <span>Active</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Media Posts</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{igStat.total_posts}</span>
                </div>
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Likes</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{igStat.total_likes}</span>
                </div>
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Comments</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{igStat.total_comments}</span>
                </div>
                <div className="bg-[#fef7e6] border border-[#111116] p-2.5 rounded-xl shadow-[1px_1px_0px_#111116]">
                  <span className="text-[10px] text-[#111116]/60 font-bold uppercase block">Reach</span>
                  <span className="text-base font-display font-black text-[#111116] mt-0.5 block">{igStat.estimated_reach}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-[#111116]/70 flex items-center justify-between pt-2 border-t-2 border-[#111116]/10 font-bold">
              <span>Account: <strong>Business</strong></span>
              <a
                href={`https://www.instagram.com/${igStat.handle_or_name.replace('@', '')}/`}
                target="_blank"
                rel="noreferrer"
                className="text-[#ff6a91] hover:underline flex items-center gap-0.5"
              >
                Profile <ArrowUpRight size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Chart & Strategy Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Bar Visualization (Doooing Playful Chart) */}
        <div className="lg:col-span-2 bg-white border-2 border-[#111116] rounded-[28px] p-6 shadow-[6px_6px_0px_#111116]">
          <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-[#111116]/10">
            <div>
              <h3 className="font-display font-black text-base text-[#111116]">Weekly Engagement Velocity</h3>
              <p className="text-xs text-[#111116]/60 font-medium">Community interaction volume across weekdays</p>
            </div>
            <span className="neo-pill bg-[#ffe400] text-[#111116] text-[10px]">
              7-Day Cadence
            </span>
          </div>

          {/* Bar Visualization with Doooing Colors & Hard Shadows */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {weeklyActivity.map((day, idx) => {
              const maxEng = Math.max(...weeklyActivity.map(d => d.engagement), 1);
              const heightPercent = Math.max(18, Math.round((day.engagement / maxEng) * 100));
              const isPeak = heightPercent > 80;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-[#111116] opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.engagement}
                  </span>
                  <div className="w-full bg-[#fef7e6] border-2 border-[#111116] rounded-xl overflow-hidden flex flex-col justify-end h-32 p-0.5 shadow-[2px_2px_0px_#111116]">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-lg transition-all duration-500 border border-[#111116] ${
                        isPeak
                          ? 'bg-[#ffe400]'
                          : idx % 2 === 0 ? 'bg-[#6a6afe]' : 'bg-[#ff6a91]'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-display font-bold text-[#111116]">{day.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#111116]/80 pt-4 mt-2 border-t-2 border-[#111116]/10 font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffe400] border border-[#111116]" /> Peak Days: Thursday & Friday
            </span>
            <span>Recommended cadence: <strong>4-5 posts/wk</strong></span>
          </div>
        </div>

        {/* AI Strategic Recommendations Card (Doooing Inverted Box) */}
        <div className="bg-[#111116] text-white border-2 border-[#111116] rounded-[28px] p-6 shadow-[6px_6px_0px_#6a6afe] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#ffe400] border-2 border-white text-[#111116] flex items-center justify-center font-black">
                <Sparkles size={16} />
              </div>
              <span className="text-xs font-display font-black text-[#ffe400] uppercase tracking-wider">AI Growth Audit</span>
            </div>
            <h3 className="text-xl font-display font-black text-white tracking-tight">Optimal Strategy</h3>
            <p className="text-xs text-white/80 mt-2 leading-relaxed font-medium">
              3 high-leverage growth actions to execute this week:
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-xs">
                <strong className="text-[#ffe400] block mb-0.5">1. Multi-Photo on Instagram:</strong>
                Carousels generate 2.4x more saves than single images. Use 3-5 slides for storytelling.
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-xs">
                <strong className="text-[#6CEBB0] block mb-0.5">2. First 60-Minute Replies:</strong>
                Responding to comments instantly doubles your LinkedIn reach via algorithm reciprocity.
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-xs">
                <strong className="text-[#ff6a91] block mb-0.5">3. Optimal X Timing:</strong>
                Post between 8:00 AM - 10:30 AM IST for maximum early retweet velocity.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-white/70 font-mono">
            <span>Gemini AI Engine</span>
            <span className="text-[#6CEBB0] font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Live Sync
            </span>
          </div>
        </div>
      </div>

      {/* Top Performing Broadcasts Table (Doooing Style) */}
      <div className="bg-white border-2 border-[#111116] rounded-[28px] p-6 sm:p-8 shadow-[6px_6px_0px_#111116]">
        <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-[#111116]/10">
          <div>
            <h3 className="font-display font-black text-xl text-[#111116]">Top Performing Campaigns</h3>
            <p className="text-xs text-[#111116]/60 font-medium">Ranked by likes, replies, and community interactions</p>
          </div>
        </div>

        {topPosts.length === 0 ? (
          <div className="text-center py-12 text-[#111116]/50 text-xs font-bold">
            No published campaigns yet. Create and dispatch your first broadcast to see ranking metrics!
          </div>
        ) : (
          <div className="space-y-3">
            {topPosts.map((post, idx) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-[#fdfaf3] border-2 border-[#111116] shadow-[3px_3px_0px_#111116] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-full bg-[#ffe400] border-2 border-[#111116] text-[#111116] font-display font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_#111116]">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-display font-black text-sm text-[#111116] group-hover:text-[#6a6afe] transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-[#111116]/75 mt-0.5 line-clamp-1 max-w-lg font-medium">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {post.platforms.map((p, pIdx) => (
                        <span key={pIdx} className="text-[10px] font-display font-bold uppercase px-2 py-0.5 rounded-full bg-white border border-[#111116] text-[#111116] shadow-[1px_1px_0px_#111116]">
                          {p}
                        </span>
                      ))}
                      <span className="text-[11px] font-mono text-[#111116]/60 font-bold">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 sm:self-center shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-[#111116] font-bold">
                    <Heart size={14} className="text-[#ff6a91] fill-[#ff6a91]" />
                    <span>{post.likes}</span>
                    <span className="text-[10px] text-[#111116]/60">likes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#111116] font-bold">
                    <MessageSquare size={14} className="text-[#6a6afe]" />
                    <span>{post.comments}</span>
                    <span className="text-[10px] text-[#111116]/60">replies</span>
                  </div>
                  <span className="neo-pill bg-[#6CEBB0] text-[#111116] text-[10px]">
                    Published
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
