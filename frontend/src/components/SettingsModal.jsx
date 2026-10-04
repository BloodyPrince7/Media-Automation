import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, ShieldAlert, Check, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { getSettings, updateSettings } from '../api/client';

export default function SettingsModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showTokens, setShowTokens] = useState(false);

  const [mockMode, setMockMode] = useState(true);
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
      setMockMode(data.mock_mode);
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
        mock_mode: mockMode,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12141c] border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between sticky top-0 bg-[#12141c]/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-neutral-300" />
            <h2 className="text-base font-semibold text-white">Platform Credentials & Engine Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Simulation Mode Switch */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-neutral-100">Simulation / Mock Mode</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  mockMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {mockMode ? 'ACTIVE (Zero API Quota Used)' : 'LIVE PRODUCTION'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                When active, all publish actions succeed with realistic mock tweet & LinkedIn post URLs without needing real API keys. Turn off when ready for live publishing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMockMode(!mockMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                mockMode ? 'bg-amber-500' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  mockMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-semibold">
              API Credentials Setup
            </span>
            <button
              type="button"
              onClick={() => setShowTokens(!showTokens)}
              className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              {showTokens ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showTokens ? 'Mask inputs' : 'Show cleartext'}</span>
            </button>
          </div>

          {/* X / Twitter Section */}
          <div className="border border-neutral-800/80 rounded-xl p-4 bg-neutral-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-sm font-semibold text-white">X (Twitter) API v2</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-mono">
                {hasXCreds ? (
                  <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Configured</span>
                ) : (
                  <span className="text-neutral-500 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Not set</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">API Key (Consumer Key)</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xApiKey}
                  onChange={(e) => setXApiKey(e.target.value)}
                  placeholder="Enter API Key"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-600"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">API Secret</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xApiSecret}
                  onChange={(e) => setXApiSecret(e.target.value)}
                  placeholder="Enter API Secret"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-600"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Access Token</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xAccessToken}
                  onChange={(e) => setXAccessToken(e.target.value)}
                  placeholder="Enter Access Token"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-600"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Access Token Secret</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={xAccessTokenSecret}
                  onChange={(e) => setXAccessTokenSecret(e.target.value)}
                  placeholder="Enter Access Token Secret"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-600"
                />
              </div>
            </div>
          </div>

          {/* LinkedIn Section */}
          <div className="border border-neutral-800/80 rounded-xl p-4 bg-neutral-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 fill-current text-[#70b5f8]" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                </svg>
                <span className="text-sm font-semibold text-white">LinkedIn API</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-mono">
                {hasLiCreds ? (
                  <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Configured</span>
                ) : (
                  <span className="text-neutral-500 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Not set</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">OAuth Access Token</label>
                <input
                  type={showTokens ? 'text' : 'password'}
                  value={liAccessToken}
                  onChange={(e) => setLiAccessToken(e.target.value)}
                  placeholder="Bearer Access Token"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-600"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Author URN (Person or Org)</label>
                <input
                  type="text"
                  value={liAuthorUrn}
                  onChange={(e) => setLiAuthorUrn(e.target.value)}
                  placeholder="urn:li:person:XXXX or urn:li:organization:XXXX"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Google Gemini API Section */}
          <div className="border border-neutral-800/80 rounded-xl p-4 bg-neutral-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Google Gemini API (Optional)</span>
              <span className="flex items-center gap-1 text-xs font-mono">
                {hasGeminiCreds ? (
                  <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Configured</span>
                ) : (
                  <span className="text-neutral-500">Heuristic fallback active</span>
                )}
              </span>
            </div>

            <div className="text-xs">
              <label className="block text-neutral-400 mb-1">Gemini API Key</label>
              <input
                type={showTokens ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-100 text-xs focus:outline-none focus:ring-1 focus:ring-neutral-600 font-mono"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                If omitted, the platform uses a smart heuristic formatter for post adaptation.
              </p>
            </div>
          </div>

          {/* Footer Save */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-800">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <Check className="w-4 h-4" /> Saved successfully!
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-neutral-200 text-neutral-950 transition-colors flex items-center gap-1.5 shadow"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
