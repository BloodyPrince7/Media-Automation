import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  LogIn,
  UserPlus
} from 'lucide-react';
import { loginUser, registerUser } from '../api/client';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    username: '',
    email: '',
    fullName: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrorMsg(null);
  };

  const handleFillDemo = () => {
    setMode('login');
    setFormData(prev => ({
      ...prev,
      usernameOrEmail: 'pankaj',
      password: 'password123'
    }));
    setErrorMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!formData.usernameOrEmail.trim() || !formData.password) {
          throw new Error('Please enter your username/email and password.');
        }
        const res = await loginUser(formData.usernameOrEmail.trim(), formData.password);
        if (res.success) {
          localStorage.setItem('social_pulse_token', res.token);
          localStorage.setItem('social_pulse_user', JSON.stringify(res.user));
          setSuccessMsg(res.message);
          setTimeout(() => {
            onAuthSuccess(res.user, res.token);
            onClose();
          }, 600);
        }
      } else {
        if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
          throw new Error('Please fill in username, email, and password.');
        }
        const res = await registerUser(
          formData.username.trim(),
          formData.email.trim(),
          formData.password,
          formData.fullName.trim() || undefined
        );
        if (res.success) {
          localStorage.setItem('social_pulse_token', res.token);
          localStorage.setItem('social_pulse_user', JSON.stringify(res.user));
          setSuccessMsg(res.message);
          setTimeout(() => {
            onAuthSuccess(res.user, res.token);
            onClose();
          }, 800);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      const detail = err.response?.data?.detail || err.message || 'Authentication failed. Please try again.';
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111116]/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[#fef7e6] border-2 border-[#111116] rounded-[32px] shadow-[8px_8px_0px_#111116] p-6 sm:p-8 relative overflow-hidden text-[#111116] view-enter">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#111116]/10 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-[#6a6afe] border-2 border-[#111116] flex items-center justify-center text-white font-display font-black text-base shadow-[2px_2px_0px_#111116]">
              P
            </span>
            <div>
              <h2 className="font-display font-black text-xl tracking-tight text-[#111116] leading-none">
                Pulse Studio
              </h2>
              <span className="text-[10px] font-bold text-[#111116]/60 uppercase tracking-wider">
                Multi-Channel Member Access
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#ff6a91] hover:text-white border-2 border-[#111116] shadow-[2px_2px_0px_#111116] flex items-center justify-center transition-all cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher (Doooing Playful Pills) */}
        <div className="flex items-center bg-white border-2 border-[#111116] p-1.5 rounded-full shadow-[3px_3px_0px_#111116] mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-full text-xs font-display font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-[#ffe400] text-[#111116] shadow-[2px_2px_0px_#111116]'
                : 'text-[#111116]/70 hover:bg-[#fef7e6]'
            }`}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 rounded-full text-xs font-display font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-[#ff6a91] text-white shadow-[2px_2px_0px_#111116]'
                : 'text-[#111116]/70 hover:bg-[#fef7e6]'
            }`}
          >
            <UserPlus size={13} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Quick Demo Pill Helper */}
        {mode === 'login' && (
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3.5 py-1 rounded-full bg-white hover:bg-[#ffe400] border-1.5 border-[#111116] text-[11px] font-display font-bold text-[#111116] shadow-[2px_2px_0px_#111116] flex items-center gap-1.5 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Zap size={11} className="text-[#6a6afe]" />
              <span>1-Click Test Demo Account (pankaj)</span>
            </button>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-[#ff6a91]/20 border-2 border-[#ff6a91] text-xs font-bold text-[#111116] flex items-start gap-2 shadow-[2px_2px_0px_#111116]">
            <AlertCircle size={15} className="text-[#ff6a91] shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-[#6CEBB0]/30 border-2 border-[#059669] text-xs font-bold text-[#111116] flex items-center gap-2 shadow-[2px_2px_0px_#111116]">
            <CheckCircle2 size={15} className="text-[#059669] shrink-0" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-display font-black text-[#111116] mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Pankaj Kumar"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-[#111116] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
                />
              </div>
            </div>
          )}

          {mode === 'register' ? (
            <>
              <div>
                <label className="block text-xs font-display font-black text-[#111116] mb-1">
                  Username <span className="text-[#ff6a91]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="e.g. pankaj"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-[#111116] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-black text-[#111116] mb-1">
                  Email Address <span className="text-[#ff6a91]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="pankaj@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-[#111116] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-display font-black text-[#111116] mb-1">
                Username or Email <span className="text-[#ff6a91]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="usernameOrEmail"
                  required
                  placeholder="Enter username or email"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  className="w-full bg-white border-2 border-[#111116] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-display font-black text-[#111116]">
                Password <span className="text-[#ff6a91]">*</span>
              </label>
              {mode === 'login' && (
                <span className="text-[10px] font-bold text-[#6a6afe]">
                  Demo: password123
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white border-2 border-[#111116] rounded-2xl pl-3.5 pr-10 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111116]/50 hover:text-[#111116] cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-full border-2 border-[#111116] font-display font-black text-sm shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111116] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#6a6afe] text-white hover:bg-[#5858ee]'
                  : 'bg-[#ff6a91] text-white hover:bg-[#f1537e]'
              }`}
            >
              {loading ? (
                <span>Verifying credentials...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In to Studio</span>
                  <ArrowRight size={15} />
                </>
              ) : (
                <>
                  <span>Create Workspace Account</span>
                  <Sparkles size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
