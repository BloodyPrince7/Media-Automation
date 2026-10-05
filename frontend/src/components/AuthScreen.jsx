import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';
import FloatingObjectsStage from './FloatingObjectsStage';
import { loginUser, registerUser } from '../api/client';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
          }, 500);
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
          }, 600);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      const detail = err.response?.data?.detail || err.message || 'Authentication failed. Please check your credentials.';
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fef7e6] text-[#111116] flex flex-col justify-between font-sans selection:bg-[#ffe400] selection:text-[#111116] relative overflow-hidden">
      
      {/* Background Interactive Floating Elements */}
      <FloatingObjectsStage />

      {/* Top Header Bar */}
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-full bg-[#6a6afe] border-2 border-[#111116] flex items-center justify-center text-white font-display font-black text-xl shadow-[2px_2px_0px_#111116]">
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
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-[#111116] bg-white text-xs font-display font-bold shadow-[2px_2px_0px_#111116]">
          <span className="w-2 h-2 rounded-full bg-[#6CEBB0] border border-[#111116]" />
          <span>System Online</span>
        </div>
      </header>

      {/* Center Auth Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-20 my-4">
        <div className="w-full max-w-md bg-[#ffffff] border-2 border-[#111116] rounded-[32px] shadow-[8px_8px_0px_#111116] p-7 sm:p-9 relative overflow-hidden view-enter">
          
          {/* Card Top Title */}
          <div className="text-center mb-6">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#111116] tracking-tight">
              {mode === 'login' ? 'Sign In to Studio' : 'Create Your Account'}
            </h1>
            <p className="text-xs text-[#111116]/70 font-medium mt-1">
              {mode === 'login'
                ? 'Welcome back! Enter your credentials to access your workbench.'
                : 'Join Pulse Studio to author, schedule, and automate your social channels.'}
            </p>
          </div>

          {/* Tab Switcher (Doooing Playful Pills) */}
          <div className="flex items-center bg-[#fef7e6] border-2 border-[#111116] p-1.5 rounded-full shadow-[3px_3px_0px_#111116] mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-full text-xs font-display font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#ffe400] text-[#111116] shadow-[2px_2px_0px_#111116]'
                  : 'text-[#111116]/70 hover:bg-white'
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
                  : 'text-[#111116]/70 hover:bg-white'
              }`}
            >
              <UserPlus size={13} />
              <span>Register</span>
            </button>
          </div>

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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-display font-black text-[#111116] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#fef7e6] border-2 border-[#111116] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
                />
              </div>
            )}

            {mode === 'register' ? (
              <>
                <div>
                  <label className="block text-xs font-display font-black text-[#111116] mb-1">
                    Username <span className="text-[#ff6a91]">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-[#fef7e6] border-2 border-[#111116] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-display font-black text-[#111116] mb-1">
                    Email Address <span className="text-[#ff6a91]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#fef7e6] border-2 border-[#111116] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-display font-black text-[#111116] mb-1">
                  Username or Email <span className="text-[#ff6a91]">*</span>
                </label>
                <input
                  type="text"
                  name="usernameOrEmail"
                  required
                  placeholder="Enter your username or email"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  className="w-full bg-[#fef7e6] border-2 border-[#111116] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-display font-black text-[#111116] mb-1">
                Password <span className="text-[#ff6a91]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#fef7e6] border-2 border-[#111116] rounded-2xl pl-3.5 pr-10 py-2.5 text-xs font-bold text-[#111116] placeholder:text-[#111116]/40 shadow-[2px_2px_0px_#111116] focus:outline-none focus:shadow-[4px_4px_0px_#6a6afe] transition-all"
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

            {/* Action Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-full border-2 border-[#111116] font-display font-black text-sm shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111116] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#6a6afe] text-white hover:bg-[#5858ee]'
                    : 'bg-[#ff6a91] text-white hover:bg-[#f1537e]'
                }`}
              >
                {loading ? (
                  <span>Processing...</span>
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
      </main>

      {/* Clean Bottom Copyright Bar */}
      <footer className="py-4 text-center text-xs font-display font-bold text-[#111116]/60 relative z-20">
        © 2026 Pulse Studio Enterprise
      </footer>

    </div>
  );
}
