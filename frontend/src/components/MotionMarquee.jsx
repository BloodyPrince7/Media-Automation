import React from 'react';
import { Sparkles, Zap, Flame, Rocket, Star, Heart, Repeat, ShieldCheck, Cpu } from 'lucide-react';

export default function MotionMarquee() {
  const items = [
    { text: 'MULTI-CHANNEL AUTOPILOT', icon: Rocket, color: 'bg-[#6a6afe] text-white' },
    { text: 'X • LINKEDIN • INSTAGRAM', icon: Repeat, color: 'bg-white text-[#111116]' },
    { text: 'GEMINI FLASH AI COPILOT', icon: Sparkles, color: 'bg-[#ff6a91] text-white' },
    { text: 'REAL-TIME ENGAGEMENT FEED', icon: Zap, color: 'bg-[#6CEBB0] text-[#111116]' },
    { text: '100% SECURE BROADCASTS', icon: ShieldCheck, color: 'bg-white text-[#111116]' },
    { text: 'SMART CAPTION OPTIMIZER', icon: Flame, color: 'bg-[#ff6a91] text-white' },
    { text: 'AUDIENCE VELOCITY METRICS', icon: Star, color: 'bg-[#6a6afe] text-white' },
    { text: 'AI MEDIA ADVISOR BOT', icon: Cpu, color: 'bg-[#6CEBB0] text-[#111116]' },
  ];

  // Repeat twice for seamless infinite scrolling
  const stream = [...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden bg-[#ffe400] border-y-2 border-[#111116] py-3.5 select-none marquee-pause z-20 shadow-[0_4px_0_#111116]/10">
      {/* Motion Tape Header Track */}
      <div className="marquee-track animate-marquee flex items-center gap-6">
        {stream.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 shrink-0 px-4 py-1 rounded-full border-2 border-[#111116] font-display font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#111116] transition-transform hover:scale-105 cursor-default group"
              style={{
                backgroundColor: item.color.includes('bg-white')
                  ? '#ffffff'
                  : item.color.includes('bg-[#6a6afe]')
                  ? '#6a6afe'
                  : item.color.includes('bg-[#ff6a91]')
                  ? '#ff6a91'
                  : '#6CEBB0',
                color: item.color.includes('text-white') ? '#ffffff' : '#111116'
              }}
            >
              <Icon className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              <span>{item.text}</span>
              <span className="text-[#111116]/40 font-mono">✦</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
