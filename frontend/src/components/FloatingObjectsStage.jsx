import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, TrendingUp, Zap, MousePointer, Flame, Check } from 'lucide-react';

export default function FloatingObjectsStage() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [likeCount, setLikeCount] = useState(142);
  const [isLiked, setIsLiked] = useState(false);
  const [cubeAngle, setCubeAngle] = useState(0);
  const [poppedBadge, setPoppedBadge] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Gentle parallax calculation centered around screen
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setIsLiked(true);
    setLikeCount((prev) => prev + 1);
    setPoppedBadge('liked');
    setTimeout(() => setPoppedBadge(null), 1500);
  };

  const handleCubeClick = (e) => {
    e.stopPropagation();
    setCubeAngle((prev) => prev + 90);
    setPoppedBadge('cube');
    setTimeout(() => setPoppedBadge(null), 1500);
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10">
      
      {/* ── 1. FLOATING 3D NEO-CUBE (Top Left) ── */}
      <div
        style={{
          transform: `translate(${mouseOffset.x * -1.2}px, ${mouseOffset.y * -1.2}px)`,
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="absolute top-10 left-6 sm:left-12 lg:left-20 pointer-events-auto"
      >
        <div
          onClick={handleCubeClick}
          className="sticker-float-1 group cursor-pointer relative"
          title="Click to spin the 3D cube!"
        >
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 relative transition-transform duration-500 ease-out group-hover:scale-110"
            style={{ transform: `rotate(${cubeAngle}deg)` }}
          >
            {/* Isometric 3D SVG Cube with Neo-Brutalist Colors */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[3px_3px_0px_#111116]">
              {/* Top Face */}
              <polygon points="50,15 85,35 50,55 15,35" fill="#ffe400" stroke="#111116" strokeWidth="3" strokeLinejoin="round" />
              {/* Left Face */}
              <polygon points="15,35 50,55 50,90 15,70" fill="#6a6afe" stroke="#111116" strokeWidth="3" strokeLinejoin="round" />
              {/* Right Face */}
              <polygon points="50,55 85,35 85,70 50,90" fill="#ff6a91" stroke="#111116" strokeWidth="3" strokeLinejoin="round" />
            </svg>
          </div>
          {poppedBadge === 'cube' && (
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#111116] text-[#ffe400] text-[10px] font-display font-black px-2 py-0.5 rounded-full border border-white whitespace-nowrap animate-bounce">
              +360° Spin!
            </span>
          )}
        </div>
      </div>

      {/* ── 2. COLLABORATIVE AI CURSOR (Top Right) ── */}
      <div
        style={{
          transform: `translate(${mouseOffset.x * 1.5}px, ${mouseOffset.y * 1.5}px)`,
          transition: 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="hidden md:block absolute top-8 right-12 lg:right-28 pointer-events-auto"
      >
        <div className="sticker-float-2 group cursor-pointer flex items-start gap-1">
          <MousePointer className="w-5 h-5 text-[#ff6a91] fill-[#ff6a91] drop-shadow-[2px_2px_0px_#111116] group-hover:rotate-12 transition-transform" />
          <div className="bg-[#ff6a91] text-white px-3 py-1 rounded-full border-2 border-[#111116] shadow-[3px_3px_0px_#111116] text-[11px] font-display font-bold flex items-center gap-1.5 group-hover:scale-105 transition-transform">
            <span className="w-2 h-2 rounded-full bg-[#ffe400] animate-ping" />
            <span>AI Copilot Active</span>
          </div>
        </div>
      </div>

      {/* ── 3. INTERACTIVE FLOATING LIKE BADGE (Mid Left) ── */}
      <div
        style={{
          transform: `translate(${mouseOffset.x * -0.8}px, ${mouseOffset.y * -0.8}px)`,
          transition: 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="hidden sm:block absolute top-44 left-4 lg:left-14 pointer-events-auto"
      >
        <div
          onClick={handleLikeClick}
          className="sticker-float-3 group cursor-pointer"
          title="Click to interact!"
        >
          <div className="bg-white border-2 border-[#111116] rounded-full px-3.5 py-1.5 shadow-[3px_3px_0px_#111116] flex items-center gap-2 transition-all group-hover:-translate-y-1 group-hover:shadow-[5px_5px_0px_#111116] group-active:translate-y-0 group-active:shadow-[1px_1px_0px_#111116]">
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                isLiked
                  ? 'fill-[#ff6a91] text-[#ff6a91] scale-125'
                  : 'text-[#111116] group-hover:text-[#ff6a91]'
              }`}
            />
            <span className="text-xs font-display font-black text-[#111116] font-mono">
              {likeCount}
            </span>
          </div>
          {poppedBadge === 'liked' && (
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#ff6a91] text-white text-[10px] font-display font-black px-2 py-0.5 rounded-full border border-[#111116] whitespace-nowrap animate-bounce shadow-[2px_2px_0px_#111116]">
              +1 Heart! ❤️
            </span>
          )}
        </div>
      </div>

      {/* ── 4. FLOATING PERFORMANCE PILL (Mid Right) ── */}
      <div
        style={{
          transform: `translate(${mouseOffset.x * 0.9}px, ${mouseOffset.y * 0.9}px)`,
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="hidden sm:block absolute top-48 right-6 lg:right-16 pointer-events-auto"
      >
        <div className="sticker-float-4 group cursor-pointer">
          <div className="bg-[#6CEBB0] text-[#111116] border-2 border-[#111116] rounded-full px-3.5 py-1.5 shadow-[3px_3px_0px_#111116] flex items-center gap-1.5 transition-all group-hover:-translate-y-1 group-hover:shadow-[5px_5px_0px_#111116]">
            <Flame className="w-4 h-4 text-[#111116] group-hover:scale-125 transition-transform" />
            <span className="text-xs font-display font-black">+42% Growth</span>
          </div>
        </div>
      </div>

      {/* ── 5. FLOATING 4-POINT SPARKLE STAR (Bottom Left) ── */}
      <div
        style={{
          transform: `translate(${mouseOffset.x * -1.5}px, ${mouseOffset.y * -1.5}px)`,
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="hidden lg:block absolute bottom-8 left-24 pointer-events-auto"
      >
        <div
          className="sticker-float-2 group cursor-pointer w-11 h-11"
          title="Sparkle energy"
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-[#ffe400] group-hover:scale-125 group-hover:rotate-45 transition-all duration-300 drop-shadow-[2px_2px_0px_#111116]"
          >
            <path
              d="M50 0 C50 35 65 50 100 50 C65 50 50 65 50 100 C50 65 35 50 0 50 C35 50 50 35 50 0 Z"
              fill="currentColor"
              stroke="#111116"
              strokeWidth="4"
            />
          </svg>
        </div>
      </div>

      {/* ── 6. FLOATING LIVE BROADCAST CHIP (Bottom Right) ── */}
      <div
        style={{
          transform: `translate(${mouseOffset.x * 1.1}px, ${mouseOffset.y * 1.1}px)`,
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="hidden lg:block absolute bottom-10 right-28 pointer-events-auto"
      >
        <div className="sticker-float-3 group cursor-pointer">
          <div className="bg-[#ffe400] text-[#111116] border-2 border-[#111116] rounded-full px-3.5 py-1.5 shadow-[3px_3px_0px_#111116] flex items-center gap-1.5 transition-all group-hover:-translate-y-1 group-hover:scale-105">
            <span className="w-2 h-2 rounded-full bg-[#111116]" />
            <span className="text-xs font-display font-bold">Autopilot Ready</span>
          </div>
        </div>
      </div>

    </div>
  );
}
