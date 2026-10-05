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
  Minimize2
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
      text: "Hey Pankaj! 👋 I'm your **Social Media Advisor**.\n\nAsk me anything about **crafting viral hooks**, **high-converting captions**, **boosting engagement**, or **algorithm tricks** across X, LinkedIn, and Instagram!",
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
          text: res.reply || "Focus on stopping the scroll with high-curiosity opening lines and prompt responses in the first 60 minutes!",
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
          <h4 key={idx} className="font-display font-black text-[#111116] text-xs mt-2.5 mb-1 flex items-center gap-1.5">
            {headerText}
          </h4>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const bulletText = trimmed.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs text-[#111116]/90 leading-relaxed font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6a91] shrink-0 mt-1.5 border border-[#111116]" />
            <span>{renderFormattedInline(bulletText)}</span>
          </div>
        );
      }

      // Numbered items
      if (/^\d+\.\s+/.test(trimmed)) {
        const num = trimmed.match(/^\d+\./)[0];
        const numText = trimmed.replace(/^\d+\.\s+/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs text-[#111116]/90 leading-relaxed font-sans">
            <span className="font-mono font-bold text-[#6a6afe] text-[11px] min-w-[18px]">{num}</span>
            <span>{renderFormattedInline(numText)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs text-[#111116]/90 leading-relaxed my-1 font-sans">
          {renderFormattedInline(trimmed)}
        </p>
      );
    });
  };

  const renderFormattedInline = (str) => {
    const parts = [];
    let keyIdx = 0;
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    let lastIndex = 0;

    while ((match = boldRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-bold text-[#111116]">
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
        <div className="w-[380px] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#fef7e6] rounded-[28px] border-2 border-[#111116] shadow-[8px_8px_0px_#111116] flex flex-col overflow-hidden mb-3 view-enter transition-all text-[#111116]">
          
          {/* Header */}
          <div className="px-5 py-3.5 bg-[#6a6afe] text-white border-b-2 border-[#111116] flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#ffe400] border-2 border-[#111116] text-[#111116] flex items-center justify-center font-black shadow-[2px_2px_0px_#111116]">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-sm leading-tight text-white tracking-tight">Social Advisor</h3>
                  <span className="text-[10px] font-display font-black px-2 py-0.5 rounded-full bg-[#ffe400] text-[#111116] border border-[#111116] shadow-[1px_1px_0px_#111116]">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11px] text-white/80 font-medium">Captions, Hooks & Algorithm Growth</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={clearChat}
                title="Reset conversation"
                className="w-7 h-7 rounded-full bg-white border-2 border-[#111116] text-[#111116] hover:bg-[#ffe400] shadow-[2px_2px_0px_#111116] flex items-center justify-center transition-all cursor-pointer"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize advisor"
                className="w-7 h-7 rounded-full bg-white border-2 border-[#111116] text-[#111116] hover:bg-[#ffebee] shadow-[2px_2px_0px_#111116] flex items-center justify-center transition-all cursor-pointer"
              >
                <Minimize2 size={12} />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fef7e6] custom-scrollbar">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-[#ffe400] border-2 border-[#111116] text-[#111116] flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_#111116]">
                    <Sparkles size={12} className="text-[#111116]" />
                  </div>
                )}

                <div className="max-w-[85%]">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed border-2 border-[#111116] ${
                      m.sender === 'user'
                        ? 'bg-[#ff6a91] text-white rounded-tr-none font-medium shadow-[3px_3px_0px_#111116]'
                        : 'bg-white text-[#111116] rounded-tl-none shadow-[3px_3px_0px_#111116]'
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
                          className="text-[11px] font-display font-bold bg-white hover:bg-[#ffe400] text-[#111116] border-2 border-[#111116] px-3 py-1 rounded-full transition-all text-left flex items-center gap-1 shadow-[2px_2px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#111116] cursor-pointer"
                        >
                          <span>{chip}</span>
                          <ArrowRight size={10} className="text-[#111116] shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#6CEBB0] border-2 border-[#111116] text-[#111116] flex items-center justify-center shrink-0 mt-0.5 text-xs font-black shadow-[1px_1px_0px_#111116]">
                    <User size={12} />
                  </div>
                )}
              </div>
            ))}

            {/* Loading animation */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#ffe400] border-2 border-[#111116] text-[#111116] flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_#111116]">
                  <Sparkles size={12} className="animate-spin text-[#111116]" />
                </div>
                <div className="bg-white border-2 border-[#111116] rounded-2xl rounded-tl-none p-3 shadow-[3px_3px_0px_#111116] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff6a91] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#6a6afe] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#ffe400] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] font-display font-bold text-[#111116] ml-1">Analyzing viral patterns...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick starter chips if first message */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-white border-t-2 border-[#111116]">
              <div className="text-[11px] font-display font-bold text-[#111116] mb-1.5 flex items-center gap-1">
                <HelpCircle size={12} className="text-[#ff6a91]" /> Popular Growth Questions:
              </div>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_QUERIES.map((q, qIdx) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={qIdx}
                      onClick={() => handleSend(q.text)}
                      className="text-[10px] font-display font-bold bg-[#fdfaf3] hover:bg-[#ffe400] text-[#111116] px-2.5 py-1 rounded-full border border-[#111116] shadow-[1px_1px_0px_#111116] transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Icon size={10} className="text-[#6a6afe]" />
                      <span>{q.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white border-t-2 border-[#111116]">
            <div className="flex items-center gap-2 bg-[#fdfaf3] border-2 border-[#111116] rounded-2xl px-3 py-1 focus-within:border-[#6a6afe] shadow-[2px_2px_0px_#111116] transition-all">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about hooks, captions, engagement..."
                className="flex-1 bg-transparent border-0 focus:ring-0 text-xs text-[#111116] placeholder:text-[#111116]/40 resize-none py-1.5 max-h-24 custom-scrollbar font-medium"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-[#ffe400] hover:bg-[#ffed4a] disabled:bg-slate-200 text-[#111116] disabled:text-slate-400 border-2 border-[#111116] shadow-[2px_2px_0px_#111116] flex items-center justify-center shrink-0 transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer"
              >
                <Send size={13} />
              </button>
            </div>
            <p className="text-[10px] font-medium text-center text-[#111116]/60 mt-1.5">
              Powered by Google Gemini · Tailored for X, LinkedIn & Instagram
            </p>
          </div>
        </div>
      )}

      {/* Floating Trigger Pill with Animated Radar Beacon */}
      {!isOpen && (
        <div className="relative">
          {/* Animated Motion Pulse Ring */}
          <span className="absolute -inset-1.5 rounded-full bg-[#ffe400]/60 animate-pulse-radar pointer-events-none -z-10" />

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-[#ffe400] hover:bg-[#ffed4a] text-[#111116] pl-3.5 pr-4 py-2.5 rounded-full border-2 border-[#111116] shadow-[4px_4px_0px_#111116] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#111116] spring-hover transition-all cursor-pointer"
            title="Open AI Social Media Advisor"
          >
            <div className="w-8 h-8 rounded-full bg-[#ff6a91] border-2 border-[#111116] text-white flex items-center justify-center shadow-[1px_1px_0px_#111116] group-hover:rotate-12 group-hover:scale-110 transition-transform">
              <Sparkles size={16} />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-display font-black leading-tight tracking-tight flex items-center gap-1.5">
                AI Advisor
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6CEBB0] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6CEBB0] border border-[#111116]"></span>
                </span>
              </span>
              <span className="text-[10px] font-bold text-[#111116]/70 leading-none">Captions & Growth</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
