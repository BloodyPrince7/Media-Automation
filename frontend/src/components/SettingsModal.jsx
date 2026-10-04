import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, ShieldAlert, Check, Eye, EyeOff, Sparkles, ExternalLink, HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { getSettings, updateSettings } from '../api/client';

export default function SettingsModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [activeGuide, setActiveGuide] = useState(null); // 'x', 'linkedin', 'instagram', 'gemini'

  const [hasXCreds, setHasXCreds] = useState(false);
  const [hasLiCreds, setHasLiCreds] = useState(false);
  const [hasIgCreds, setHasIgCreds] = useState(false);
  const [hasGeminiCreds, setHasGeminiCreds] = useState(false);

  // Form states
  const [xApiKey, setXApiKey] = useState('');
  const [xApiSecret, setXApiSecret] = useState('');
  const [xAccessToken, setXAccessToken] = useState('');
  const [xAccessTokenSecret, setXAccessTokenSecret] = useState('');
  const [xBearerToken, setXBearerToken] = useState('');

  const [liClientId, setLiClientId] = useState('');
  const [liClientSecret, setLiClientSecret] = useState('');
  const [liAccessToken, setLiAccessToken] = useState('');
  const [liAuthorUrn, setLiAuthorUrn] = useState('');

  const [igAccessToken, setIgAccessToken] = useState('');
  const [igAccountId, setIgAccountId] = useState('');

  const [geminiApiKey, setGeminiApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setHasXCreds(data.has_x_credentials);
      setHasLiCreds(data.has_linkedin_credentials);
      setHasIgCreds(data.has_instagram_credentials);
      setHasGeminiCreds(data.has_gemini_credentials);
      if (data.linkedin_author_urn) setLiAuthorUrn(data.linkedin_author_urn);
      if (data.instagram_account_id) setIgAccountId(data.instagram_account_id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      const payload = {
        ...(xApiKey && { x_api_key: xApiKey }),
        ...(xApiSecret && { x_api_secret: xApiSecret }),
        ...(xAccessToken && { x_access_token: xAccessToken }),
        ...(xAccessTokenSecret && { x_access_token_secret: xAccessTokenSecret }),
        ...(xBearerToken && { x_bearer_token: xBearerToken }),
        ...(liClientId && { linkedin_client_id: liClientId }),
        ...(liClientSecret && { linkedin_client_secret: liClientSecret }),
        ...(liAccessToken && { linkedin_access_token: liAccessToken }),
        ...(liAuthorUrn && { linkedin_author_urn: liAuthorUrn }),
        ...(igAccessToken && { instagram_access_token: igAccessToken }),
        ...(igAccountId && { instagram_account_id: igAccountId }),
        ...(geminiApiKey && { gemini_api_key: geminiApiKey }),
      };

      await updateSettings(payload);
      setSavedSuccess(true);
      await loadSettings();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error updating credentials: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-[#111116] rounded-[28px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_#111116] flex flex-col relative text-[#111116]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-[#111116] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffe400] border-2 border-[#111116] flex items-center justify-center text-[#111116] shadow-[2px_2px_0px_#111116]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-[#111116]">
                Platform API Gateways
              </h2>
              <p className="text-xs text-[#111116]/60 font-medium">Configure developer credentials for X, LinkedIn, Instagram & AI Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border-2 border-[#111116] flex items-center justify-center text-[#111116] hover:bg-[#ffebee] shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-display font-bold tracking-wider text-[#111116]/70">
              Gateway Configuration
            </span>
            <button
              type="button"
              onClick={() => setShowTokens(!showTokens)}
              className="text-xs text-[#111116] hover:text-[#6a6afe] flex items-center gap-1.5 font-display font-bold transition-colors cursor-pointer"
            >
              {showTokens ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTokens ? 'Mask inputs' : 'Show cleartext'}</span>
            </button>
          </div>

          {/* X / Twitter Section */}
          <div className="border-2 border-[#111116] rounded-2xl p-4.5 bg-[#fdfaf3] space-y-3.5 shadow-[2px_2px_0px_#111116]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#111116] text-white flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-display font-bold text-[#111116]">X (Twitter) Developer Portal</span>
                  <p className="text-[11px] text-[#111116]/60 font-medium">OAuth 1.0a User Context Credentials</p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-xs font-mono font-bold">
                {hasXCreds ? (
                  <span className="text-[#2e7d32] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-[#b71c1c] bg-[#ffebee] px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Incomplete
                  </span>
                )}
              </span>
            </div>

            {/* Guide Toggle */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setActiveGuide(activeGuide === 'x' ? null : 'x')}
                className="text-[11px] text-[#111116] hover:text-[#6a6afe] flex items-center gap-1 font-semibold underline decoration-dotted cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-[#6a6afe]" />
                <span>{activeGuide === 'x' ? 'Hide documentation' : 'How to get X tokens & keys'}</span>
                {activeGuide === 'x' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* X Guide Drawer */}
            {activeGuide === 'x' && (
              <div className="p-3.5 bg-white border-2 border-[#111116] rounded-xl text-xs space-y-2 animate-fade-in shadow-[2px_2px_0px_#111116]">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-primary-600" /> Guide: Obtaining X API Credentials
                  </span>
                  <a
                    href="https://developer.x.com/en/portal/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    Open Developer Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li>Log in to <strong className="text-slate-900">developer.x.com</strong> and open your Project / App.</li>
                  <li>In <strong className="text-slate-900">User authentication settings</strong>, set App Permissions to <strong className="text-slate-900">Read and Write</strong> (Crucial for automated posting!).</li>
                  <li>Under <strong className="text-slate-900">Keys and tokens</strong>, generate your <strong className="text-slate-900">Consumer Keys (API Key & Secret)</strong>.</li>
                  <li>Under <strong className="text-slate-900">Authentication Tokens</strong>, generate your <strong className="text-slate-900">Access Token & Secret</strong> paired with your Read & Write access.</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#111116] font-display font-bold mb-1">API Key (Consumer Key)</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xApiKey}
                  onChange={(e) => setXApiKey(e.target.value)}
                  placeholder="Enter API Key"
                  className="w-full bg-white border-2 border-[#111116] focus:border-[#6a6afe] rounded-xl px-3 py-2 text-[#111116] text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#111116] font-display font-bold mb-1">API Secret</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xApiSecret}
                  onChange={(e) => setXApiSecret(e.target.value)}
                  placeholder="Enter API Secret"
                  className="w-full bg-white border-2 border-[#111116] focus:border-[#6a6afe] rounded-xl px-3 py-2 text-[#111116] text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#111116] font-display font-bold mb-1">Access Token</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xAccessToken}
                  onChange={(e) => setXAccessToken(e.target.value)}
                  placeholder="Enter Access Token"
                  className="w-full bg-white border-2 border-[#111116] focus:border-[#6a6afe] rounded-xl px-3 py-2 text-[#111116] text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#111116] font-display font-bold mb-1">Access Token Secret</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xAccessTokenSecret}
                  onChange={(e) => setXAccessTokenSecret(e.target.value)}
                  placeholder="Enter Access Token Secret"
                  className="w-full bg-white border-2 border-[#111116] focus:border-[#6a6afe] rounded-xl px-3 py-2 text-[#111116] text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* LinkedIn Section */}
          <div className="border-2 border-[#111116] rounded-2xl p-4.5 bg-[#fdfaf3] space-y-3.5 shadow-[2px_2px_0px_#111116]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#6a6afe] text-white flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-display font-bold text-[#111116]">LinkedIn Developer Platform</span>
                  <p className="text-[11px] text-[#111116]/60 font-medium">UGC Posts & Social Actions Token</p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-xs font-mono font-bold">
                {hasLiCreds ? (
                  <span className="text-[#2e7d32] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-[#b71c1c] bg-[#ffebee] px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Incomplete
                  </span>
                )}
              </span>
            </div>

            {/* Guide Toggle */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setActiveGuide(activeGuide === 'li' ? null : 'li')}
                className="text-[11px] text-[#111116] hover:text-[#6a6afe] flex items-center gap-1 font-semibold underline decoration-dotted cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-[#6a6afe]" />
                <span>{activeGuide === 'li' ? 'Hide documentation' : 'How to get LinkedIn Token & URN'}</span>
                {activeGuide === 'li' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* LinkedIn Guide Drawer */}
            {activeGuide === 'li' && (
              <div className="p-3.5 bg-white border-2 border-[#111116] rounded-xl text-xs space-y-2 animate-fade-in shadow-[2px_2px_0px_#111116]">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#0a66c2]" /> Guide: LinkedIn OAuth Token & Author URN
                  </span>
                  <a
                    href="https://www.linkedin.com/developers/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#0a66c2] hover:underline flex items-center gap-1"
                  >
                    Open LinkedIn Developers <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li>Go to <strong className="text-slate-900">linkedin.com/developers/apps</strong> and create an App.</li>
                  <li>In the <strong className="text-slate-900">Products</strong> tab, request access to <strong className="text-slate-900">Share on LinkedIn</strong> and <strong className="text-slate-900">Sign In with LinkedIn using OpenID Connect</strong> (enables <code className="bg-slate-100 px-1 rounded">w_member_social</code>).</li>
                  <li>Use the <strong className="text-slate-900">Token Generator tool</strong> in the Developer Portal to generate your 60-day OAuth Access Token.</li>
                  <li><strong className="text-slate-900">Author URN:</strong> Format is <code className="bg-slate-100 px-1 rounded">urn:li:person:YOUR_ID</code> (e.g. <code className="bg-slate-100 px-1 rounded">urn:li:person:XK-FFGXYeP</code>) or for organization pages <code className="bg-slate-100 px-1 rounded">urn:li:organization:123456</code>.</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#111116] font-display font-bold mb-1">OAuth Access Token</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={liAccessToken}
                  onChange={(e) => setLiAccessToken(e.target.value)}
                  placeholder="Bearer Access Token"
                  className="w-full bg-white border-2 border-[#111116] focus:border-[#6a6afe] rounded-xl px-3 py-2 text-[#111116] text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#111116] font-display font-bold mb-1">Author URN (Person or Org)</label>
                <input
                  type="text"
                  value={liAuthorUrn}
                  onChange={(e) => setLiAuthorUrn(e.target.value)}
                  placeholder="urn:li:person:XXXX"
                  className="w-full bg-white border-2 border-[#111116] focus:border-[#6a6afe] rounded-xl px-3 py-2 text-[#111116] text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Instagram Meta Graph API Section */}
          <div className="border-2 border-[#111116] rounded-2xl p-4.5 bg-[#fdfaf3] space-y-3.5 shadow-[2px_2px_0px_#111116]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-display font-bold text-[#111116]">Instagram Graph API Gateway</span>
                  <p className="text-[11px] text-[#111116]/60 font-medium">Meta Professional Account publishing & feed engagement</p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-xs font-mono font-bold">
                {hasIgCreds ? (
                  <span className="text-[#2e7d32] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-[#b71c1c] bg-[#ffebee] px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Incomplete
                  </span>
                )}
              </span>
            </div>

            {/* Guide Toggle */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setActiveGuide(activeGuide === 'ig' ? null : 'ig')}
                className="text-[11px] text-[#111116] hover:text-[#6a6afe] flex items-center gap-1 font-semibold underline decoration-dotted cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-[#6a6afe]" />
                <span>{activeGuide === 'ig' ? 'Hide documentation' : 'How to get Instagram Token & Account ID'}</span>
                {activeGuide === 'ig' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Instagram Guide Drawer */}
            {activeGuide === 'ig' && (
              <div className="p-3.5 bg-white border-2 border-[#111116] rounded-xl text-xs space-y-2 animate-fade-in shadow-[2px_2px_0px_#111116]">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-pink-600" /> Guide: Instagram Graph API Token & Account ID
                  </span>
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-pink-600 hover:underline flex items-center gap-1"
                  >
                    Open Meta Developers <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li>Ensure your Instagram account is switched to a <strong className="text-slate-900">Professional (Business or Creator)</strong> account.</li>
                  <li>In <strong className="text-slate-900">developers.facebook.com/apps</strong> &rarr; Create App &rarr; Choose type <strong className="text-slate-900">Other</strong> &rarr; Add <strong className="text-slate-900">Instagram Graph API</strong>.</li>
                  <li>Under App Dashboard &rarr; Tools &rarr; <strong className="text-slate-900">Graph API Explorer</strong>, select your app and request: <code className="bg-slate-100 px-1 rounded">instagram_basic</code> and <code className="bg-slate-100 px-1 rounded">instagram_content_publish</code>.</li>
                  <li>Click <strong className="text-slate-900">Generate Access Token</strong> and paste the token above.</li>
                  <li><strong className="text-slate-900">Account ID:</strong> Run <code className="bg-slate-100 px-1 rounded">GET /me?fields=id,username</code> with your token to see your Instagram Account ID (e.g. <code className="bg-slate-100 px-1 rounded">28960740636950255</code>).</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#111116] font-display font-bold mb-1">Graph API Access Token</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={igAccessToken}
                  onChange={(e) => setIgAccessToken(e.target.value)}
                  placeholder="EAABw... or IGAAT..."
                  className="w-full bg-white border-2 border-[#111116] focus:border-[#dc2743] rounded-xl px-3 py-2 text-[#111116] text-xs font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#111116] font-display font-bold mb-1">Instagram Business Account ID</label>
                <input
                  type="text"
                  value={igAccountId}
                  onChange={(e) => setIgAccountId(e.target.value)}
                  placeholder="28960740636950255"
                  className="w-full bg-white border-2 border-[#111116] focus:border-[#dc2743] rounded-xl px-3 py-2 text-[#111116] text-xs font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* AI Intelligence Engine Section */}
          <div className="border-2 border-[#111116] rounded-2xl p-4.5 bg-[#fdfaf3] space-y-3.5 shadow-[2px_2px_0px_#111116]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#ff6a91] text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-sm font-display font-bold text-[#111116]">AI Intelligence Engine</span>
                  <p className="text-[11px] text-[#111116]/60 font-medium">Powers multimodal media captioning and channel variant adaptation</p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-xs font-mono font-bold">
                {hasGeminiCreds ? (
                  <span className="text-[#2e7d32] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="text-[#b71c1c] bg-[#ffebee] px-2.5 py-0.5 rounded-full border border-[#111116] flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Key Required
                  </span>
                )}
              </span>
            </div>

            {/* Guide Toggle */}
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setActiveGuide(activeGuide === 'gemini' ? null : 'gemini')}
                className="text-[11px] text-[#111116] hover:text-[#6a6afe] flex items-center gap-1 font-semibold underline decoration-dotted cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-[#ff6a91]" />
                <span>{activeGuide === 'gemini' ? 'Hide documentation' : 'How to get free Gemini API Key'}</span>
                {activeGuide === 'gemini' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Gemini Guide Drawer */}
            {activeGuide === 'gemini' && (
              <div className="p-3.5 bg-white border-2 border-[#111116] rounded-xl text-xs space-y-2 animate-fade-in shadow-[2px_2px_0px_#111116]">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Guide: Google Gemini API Key
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    Open Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                  <li>Navigate to <strong className="text-slate-900">aistudio.google.com/app/apikey</strong> and sign in with your Google account.</li>
                  <li>Click the blue <strong className="text-slate-900">Create API Key</strong> button (Free quota included).</li>
                  <li>Select or create a Google Cloud project, then copy your generated key (starts with <code className="bg-slate-100 px-1 rounded">AIzaSy...</code>) and paste it below.</li>
                </ol>
              </div>
            )}

            <div className="text-xs">
              <label className="block text-[#111116] font-display font-bold mb-1">AI Engine API Key</label>
              <input
                type={showTokens ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-white border-2 border-[#111116] focus:border-[#6a6afe] rounded-xl px-3 py-2 text-[#111116] text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#111116]/10">
            {savedSuccess && (
              <span className="text-xs text-[#2e7d32] flex items-center gap-1 font-display font-bold">
                <Check className="w-4 h-4" /> Configuration saved!
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-display font-bold bg-white hover:bg-[#fef7e6] border-2 border-[#111116] text-[#111116] shadow-[2px_2px_0px_#111116] transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full text-xs font-display font-black bg-[#ffe400] text-[#111116] border-2 border-[#111116] shadow-[3px_3px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Gateways'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
