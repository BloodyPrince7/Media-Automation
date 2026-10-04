import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, ShieldAlert, Check, Eye, EyeOff, Sparkles } from 'lucide-react';
import { getSettings, updateSettings } from '../api/client';

export default function SettingsModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  const [hasXCreds, setHasXCreds] = useState(false);
  const [hasLiCreds, setHasLiCreds] = useState(false);
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
      setHasGeminiCreds(data.has_gemini_credentials);
      if (data.linkedin_author_urn) setLiAuthorUrn(data.linkedin_author_urn);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0f111a] border border-white/[0.12] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between sticky top-0 bg-[#0f111a]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 p-[1px] flex items-center justify-center shadow-md">
              <div className="w-full h-full bg-[#0f111a] rounded-[11px] flex items-center justify-center">
                <Key className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
                Platform API Gateways
              </h2>
              <p className="text-[11px] text-neutral-400">Configure your direct developer credentials for X & LinkedIn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-bold">
              Gateway Configuration
            </span>
            <button
              type="button"
              onClick={() => setShowTokens(!showTokens)}
              className="text-xs text-neutral-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors font-medium"
            >
              {showTokens ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTokens ? 'Mask inputs' : 'Show cleartext'}</span>
            </button>
          </div>

          {/* X / Twitter Section */}
          <div className="border border-sky-500/25 rounded-2xl p-4.5 bg-[#0a0d17]/80 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 border border-sky-500/30">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-bold text-white">X (Twitter) Developer Portal</span>
                  <p className="text-[11px] text-neutral-400">OAuth 1.0a & OAuth 2.0 Credentials</p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-xs font-mono font-semibold">
                {hasXCreds ? (
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Incomplete
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">API Key (Consumer Key)</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xApiKey}
                  onChange={(e) => setXApiKey(e.target.value)}
                  placeholder="Enter API Key"
                  className="w-full bg-[#121422] border border-white/[0.08] focus:border-sky-400 rounded-xl px-3 py-2 text-neutral-100 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">API Secret</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xApiSecret}
                  onChange={(e) => setXApiSecret(e.target.value)}
                  placeholder="Enter API Secret"
                  className="w-full bg-[#121422] border border-white/[0.08] focus:border-sky-400 rounded-xl px-3 py-2 text-neutral-100 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Access Token</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xAccessToken}
                  onChange={(e) => setXAccessToken(e.target.value)}
                  placeholder="Enter Access Token"
                  className="w-full bg-[#121422] border border-white/[0.08] focus:border-sky-400 rounded-xl px-3 py-2 text-neutral-100 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Access Token Secret</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xAccessTokenSecret}
                  onChange={(e) => setXAccessTokenSecret(e.target.value)}
                  placeholder="Enter Access Token Secret"
                  className="w-full bg-[#121422] border border-white/[0.08] focus:border-sky-400 rounded-xl px-3 py-2 text-neutral-100 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* LinkedIn Section */}
          <div className="border border-blue-500/25 rounded-2xl p-4.5 bg-[#0a0d17]/80 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-bold text-white">LinkedIn Developer Platform</span>
                  <p className="text-[11px] text-neutral-400">Posts REST API Access Token</p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-xs font-mono font-semibold">
                {hasLiCreds ? (
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Incomplete
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">OAuth Access Token</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={liAccessToken}
                  onChange={(e) => setLiAccessToken(e.target.value)}
                  placeholder="Bearer Access Token"
                  className="w-full bg-[#121422] border border-white/[0.08] focus:border-blue-400 rounded-xl px-3 py-2 text-neutral-100 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-300 font-medium mb-1">Author URN (Person or Org)</label>
                <input
                  type="text"
                  value={liAuthorUrn}
                  onChange={(e) => setLiAuthorUrn(e.target.value)}
                  placeholder="urn:li:person:XXXX or urn:li:organization:XXXX"
                  className="w-full bg-[#121422] border border-white/[0.08] focus:border-blue-400 rounded-xl px-3 py-2 text-neutral-100 text-xs focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Google Gemini API Section */}
          <div className="border border-fuchsia-500/25 rounded-2xl p-4.5 bg-[#0a0d17]/80 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 border border-fuchsia-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">Google Gemini API (Optional)</span>
                  <p className="text-[11px] text-neutral-400">Powers generative rewriting & platform synthesis</p>
                </div>
              </div>

              <span className="flex items-center gap-1 text-xs font-mono font-semibold">
                {hasGeminiCreds ? (
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-neutral-400 text-[11px]">Heuristic fallback active</span>
                )}
              </span>
            </div>

            <div className="text-xs">
              <label className="block text-neutral-300 font-medium mb-1">Gemini API Key</label>
              <input
                type={showTokens ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#121422] border border-white/[0.08] focus:border-fuchsia-400 rounded-xl px-3 py-2 text-neutral-100 text-xs focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                <Check className="w-4 h-4" /> Configuration saved!
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-500 hover:to-fuchsia-400 text-white transition-all flex items-center gap-2 shadow-lg shadow-violet-500/25 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Gateways'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
