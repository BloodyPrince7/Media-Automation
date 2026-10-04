import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  TrendingUp,
  Clock,
  Hash,
  HelpCircle,
  RotateCcw,
  Minimize2,
  ChevronUp
} from 'lucide-react';
import { askMediaAdvisor } from '../api/client';

const SUGGESTED_QUERIES = [
  { text: "Viral hook formulas for LinkedIn", icon: TrendingUp },
  { text: "Best caption structure for Instagram", icon: Sparkles },
  { text: "How to maximize engagement on X", icon: MessageSquare },
  { text: "Best times & cadence to post", icon: Clock },
  { text: "Smart hashtag rules per platform", icon: Hash }
];

export default function MediaAdvisorBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hey Pankaj! 👋 I'm your **AI Social Media Advisor**.\n\nAsk me anything about **crafting viral hooks**, **high-converting captions**, **boosting engagement**, or **algorithm tricks** across X, LinkedIn, and Instagram!",
      followups: [
        "Viral hook formulas for LinkedIn",
        "Best caption structure for Instagram",
        "How to maximize engagement on X"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText = null) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    const newMessages = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const history = newMessages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));

      const res = await askMediaAdvisor(textToSend, history);

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: res.reply || "I analyzed your question. Focus on stopping the scroll with high-curiosity opening lines and prompt responses in the first 60 minutes!",
          followups: res.suggested_followups || []
        }
      ]);
    } catch (err) {
      console.error('Advisor error:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "I couldn't reach the advisor network at the moment. Quick tip: Structure your posts with a 1-sentence hook, 3 concise value bullets, and end with an open question!",
          followups: [
            "Best caption structure for Instagram",
            "How to maximize engagement on X"
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: "Chat refreshed. What social media question would you like advice on today?",
        followups: [
          "Viral hook formulas for LinkedIn",
          "Best caption structure for Instagram",
          "How to maximize engagement on X"
        ]
      }
    ]);
  };

  // Helper to format basic markdown (bold, headers, bullets, italics)
  const formatMarkdown = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Header 3 or 2
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
        const headerText = trimmed.replace(/^#{2,3}\s+/, '');
        return (
          <h4 key={idx} className="font-semibold text-slate-900 text-sm mt-2 mb-1 flex items-center gap-1.5">
            {headerText}
          </h4>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const bulletText = trimmed.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs text-slate-700 leading-relaxed">
            <span className="text-primary-600 font-bold leading-none mt-1">•</span>
            <span>{renderFormattedInline(bulletText)}</span>
          </div>
        );
      }

      // Numbered items
      if (/^\d+\.\s+/.test(trimmed)) {
        const num = trimmed.match(/^\d+\./)[0];
        const numText = trimmed.replace(/^\d+\.\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-primary-600 text-[11px] min-w-[18px]">{num}</span>
            <span>{renderFormattedInline(numText)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed my-1">
          {renderFormattedInline(trimmed)}
        </p>
      );
    });
  };

  const renderFormattedInline = (str) => {
    // Basic bold and italic replacement
    const parts = [];
    let remaining = str;
    let keyIdx = 0;

    // Split on **bold**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-slate-900">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : str;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bot Chat Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[560px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden mb-3 animate-fade-in transition-all backdrop-blur-xl">
          {/* Header */}
          <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                  <Bot size={17} />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm leading-none text-white tracking-tight">Social Advisor</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Captions, Hooks & Algorithm Strategy</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Reset conversation"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize advisor"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Minimize2 size={14} />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 custom-scrollbar">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-sm">
                    <Sparkles size={13} className="text-primary-400" />
                  </div>
                )}

                <div className="max-w-[85%]">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-none font-medium'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                    }`}
                  >
                    {m.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <div className="space-y-1">{formatMarkdown(m.text)}</div>
                    )}
                  </div>

                  {/* Followup suggestion chips */}
                  {m.followups && m.followups.length > 0 && idx === messages.length - 1 && !isLoading && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.followups.map((chip, chipIdx) => (
                        <button
                          key={chipIdx}
                          onClick={() => handleSend(chip)}
                          className="text-[11px] bg-white hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-200 hover:border-primary-200 px-2.5 py-1 rounded-full transition-all text-left flex items-center gap-1 shadow-2xs hover:shadow-xs active:scale-95"
                        >
                          <span>{chip}</span>
                          <ArrowRight size={10} className="text-slate-400 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}

            {/* Loading animation */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={13} className="text-primary-400 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-3.5 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-slate-500 font-medium ml-2">Advisor analyzing strategies...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick starter chips if first message */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-white border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                <HelpCircle size={12} /> Popular Growth Topics:
              </div>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_QUERIES.map((q, qIdx) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={qIdx}
                      onClick={() => handleSend(q.text)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-all flex items-center gap-1"
                    >
                      <Icon size={11} className="text-primary-600" />
                      <span>{q.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about hooks, captions, engagement..."
                className="flex-1 bg-transparent border-0 focus:ring-0 text-xs text-slate-900 placeholder:text-slate-400 resize-none py-1.5 max-h-24 custom-scrollbar"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center shrink-0 transition-all shadow-sm active:scale-95"
              >
                <Send size={13} />
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-1.5">
              Powered by Google Gemini · Tailored for X, LinkedIn & Instagram
            </p>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white pl-3.5 pr-4 py-3 rounded-full shadow-xl hover:shadow-2xl border border-slate-700 transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
          title="Open Social Media Advisor"
        >
          {/* Subtle glowing animated ring */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 opacity-30 group-hover:opacity-75 blur-sm transition duration-300 animate-pulse" />

          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 text-white shadow-xs">
            <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
          </div>

          <div className="relative flex flex-col text-left">
            <span className="text-xs font-semibold leading-tight tracking-tight flex items-center gap-1.5">
              AI Advisor
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Captions & Growth</span>
          </div>
        </button>
      )}
    </div>
  );
}
