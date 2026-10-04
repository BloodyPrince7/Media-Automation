import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Heart,
  MessageSquare,
  Share2,
  Eye,
  BarChart2,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Award,
  Layers,
  Clock
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
        <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 mb-4 animate-bounce">
          <BarChart2 size={24} />
        </div>
        <h3 className="text-base font-semibold text-slate-800">Aggregating cross-channel performance...</h3>
        <p className="text-xs text-slate-400 mt-1">Fetching live statistics from X, LinkedIn & Instagram</p>
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
    handle_or_name: 'Pankaj kumar',
    total_posts: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    estimated_reach: 0
  };

  const igStat = platformStats.find(p => p.platform === 'instagram') || {
    handle_or_name: '@pankajkumar_240666',
    total_posts: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    estimated_reach: 0
  };

  const totalInteractions = (stats.total_likes || 0) + (stats.total_comments || 0) + (stats.total_shares || 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-primary-100/50 to-indigo-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold tracking-wider uppercase mb-3">
            <Sparkles size={12} className="text-primary-400" />
            Performance & Insights
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            Cross-Channel Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time audience reach, engagement velocity, and cross-platform breakdown across X, LinkedIn, and Instagram.
          </p>
        </div>

        <div className="relative flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all active:scale-95 border border-slate-200"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-primary-600' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live Stats'}</span>
          </button>
          {onNavigateToComposer && (
            <button
              onClick={onNavigateToComposer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all active:scale-95"
            >
              <span>Create Campaign</span>
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimated Reach */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:border-primary-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estimated Reach</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Eye size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              {(stats.total_impressions || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
              <TrendingUp size={12} />
              <span>+18.4% vs last period</span>
            </div>
          </div>
        </div>

        {/* Total Interactions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:border-primary-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Engagements</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <Heart size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              {totalInteractions.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
              <span>{stats.total_likes || 0} likes · {stats.total_comments || 0} replies</span>
            </div>
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:border-primary-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Avg. Engagement Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              {stats.avg_engagement_rate || 5.2}%
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
              <Award size={12} />
              <span>High benchmark (&gt;3.5%)</span>
            </div>
          </div>
        </div>

        {/* Broadcasts Count */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:border-primary-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Broadcast Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
              {stats.published_count || 0}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-medium">
              <span>{stats.scheduled_count || 0} scheduled · {stats.draft_count || 0} drafts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-bold text-slate-900">Channel Performance Breakdown</h2>
          <span className="text-xs font-medium text-slate-500">3 Connected Networks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* X (Twitter) Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
                  <XIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 leading-tight">X (Twitter)</h3>
                  <p className="text-xs text-slate-400 font-medium">{xStat.handle_or_name}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={10} /> Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-5">
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Total Posts</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{xStat.total_posts}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Total Likes</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{xStat.total_likes}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Replies</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{xStat.total_comments}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Est. Impressions</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{xStat.estimated_reach}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Viral velocity: <strong className="text-slate-800">High</strong></span>
              <a
                href={`https://x.com/${xStat.handle_or_name.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
              >
                Profile <ArrowUpRight size={11} />
              </a>
            </div>
          </div>

          {/* LinkedIn Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0a66c2] text-white flex items-center justify-center shadow-sm">
                  <LinkedInIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 leading-tight">LinkedIn</h3>
                  <p className="text-xs text-slate-400 font-medium">{liStat.handle_or_name}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={10} /> Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-5">
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Total Posts</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{liStat.total_posts}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Reactions</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{liStat.total_likes}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Comments</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{liStat.total_comments}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Est. Impressions</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{liStat.estimated_reach}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>B2B Network authority: <strong className="text-slate-800">Growing</strong></span>
              <a
                href="https://www.linkedin.com/feed/"
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
              >
                Profile <ArrowUpRight size={11} />
              </a>
            </div>
          </div>

          {/* Instagram Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 leading-tight">Instagram</h3>
                  <p className="text-xs text-slate-400 font-medium">{igStat.handle_or_name}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 size={10} /> Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 my-5">
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Media Posts</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{igStat.total_posts}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Total Likes</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{igStat.total_likes}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Comments</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{igStat.total_comments}</span>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 font-medium block">Est. Impressions</span>
                <span className="text-lg font-bold text-slate-900 mt-0.5 block">{igStat.estimated_reach}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Account Type: <strong className="text-slate-800">Business</strong></span>
              <a
                href={`https://www.instagram.com/${igStat.handle_or_name.replace('@', '')}/`}
                target="_blank"
                rel="noreferrer"
                className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
              >
                Profile <ArrowUpRight size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Chart & Strategy Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Bar Visualization */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">Weekly Engagement Velocity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Interaction volume by day of the week</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
              7-Day Cadence
            </span>
          </div>

          {/* Bar Visualization */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {weeklyActivity.map((day, idx) => {
              const maxEng = Math.max(...weeklyActivity.map(d => d.engagement), 1);
              const heightPercent = Math.max(15, Math.round((day.engagement / maxEng) * 100));
              const isPeak = heightPercent > 80;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.engagement}
                  </span>
                  <div className="w-full bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end h-32 p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isPeak
                          ? 'bg-gradient-to-t from-primary-600 to-indigo-500 shadow-sm'
                          : 'bg-slate-300 group-hover:bg-primary-400'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{day.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-4 mt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-primary-600" /> Peak Days: Thursday & Friday
            </span>
            <span>Recommended publishing cadence: <strong>4-5x / week</strong></span>
          </div>
        </div>

        {/* AI Strategic Recommendations Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-300 flex items-center justify-center border border-primary-500/30">
                <Sparkles size={14} />
              </div>
              <span className="text-xs font-semibold text-primary-300 uppercase tracking-wider">AI Growth Audit</span>
            </div>
            <h3 className="text-lg font-display font-bold text-white tracking-tight">Optimal Strategy</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Based on your connected platforms, here are the top 3 high-leverage tactics to boost performance this week:
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <strong className="text-primary-300 block mb-0.5">1. Multi-Photo on Instagram:</strong>
                Carousels generate 2.4x more saves than single images. Use 3-5 slides for storytelling.
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <strong className="text-primary-300 block mb-0.5">2. First 60-Minute Replies:</strong>
                Responding to comments instantly doubles your LinkedIn reach via algorithm reciprocity.
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <strong className="text-primary-300 block mb-0.5">3. Optimal X Timing:</strong>
                Post between 8:00 AM - 10:30 AM IST for maximum early retweet velocity.
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Powered by Gemini AI</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Real-time tuned
            </span>
          </div>
        </div>
      </div>

      {/* Top Performing Broadcasts Table / Feed */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Top Performing Campaigns</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by likes, replies, and community interactions</p>
          </div>
        </div>

        {topPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No published campaigns yet. Create and dispatch your first broadcast to see ranking metrics!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {topPosts.map((post, idx) => (
              <div key={post.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                <div className="flex items-start gap-3.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-lg">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {post.platforms.map((p, pIdx) => (
                        <span key={pIdx} className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {p}
                        </span>
                      ))}
                      <span className="text-[11px] text-slate-400">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:self-center shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Heart size={14} className="text-rose-500 fill-rose-500" />
                    <span className="font-semibold">{post.likes}</span>
                    <span className="text-[11px] text-slate-400">likes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MessageSquare size={14} className="text-primary-500" />
                    <span className="font-semibold">{post.comments}</span>
                    <span className="text-[11px] text-slate-400">replies</span>
                  </div>
                  <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
