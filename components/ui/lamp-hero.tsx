"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeroProps {
  headline: {
    line1: string;
    line2: string;
    line3?: string;
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  note?: string;
  identity?: {
    name: string;
    title: string;
  };
  className?: string;
}

// ─── Lamp Hero ────────────────────────────────────────────────────────────────

const LampHero: React.FC<HeroProps> = ({
  headline,
  subtitle,
  buttons,
  note,
  identity,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "relative w-full min-h-dvh overflow-x-hidden bg-[#0D0D0D]",
        className
      )}
    >
      {/* ── Lamp visual (clipped in its own layer so content never gets cut) ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="relative flex h-[60vh] min-h-[420px] w-full scale-y-125 items-center justify-center isolate z-0">
          {/* Left cone */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] bg-gradient-conic from-[#C87941] via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top]"
          >
            <div className="absolute w-[100%] left-0 bg-[#0D0D0D] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
            <div className="absolute w-40 h-[100%] left-0 bg-[#0D0D0D] bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
          </motion.div>

          {/* Right cone */}
          <motion.div
            initial={{ opacity: 0.5, width: "15rem" }}
            whileInView={{ opacity: 1, width: "30rem" }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute inset-auto left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-[#C87941] text-white [--conic-position:from_290deg_at_center_top]"
          >
            <div className="absolute w-40 h-[100%] right-0 bg-[#0D0D0D] bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
            <div className="absolute w-[100%] right-0 bg-[#0D0D0D] h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          </motion.div>

          {/* Depth + glow layers */}
          <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-[#0D0D0D] blur-2xl" />
          <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />
          <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-[#C87941] opacity-50 blur-3xl" />
          <motion.div
            initial={{ width: "8rem" }}
            whileInView={{ width: "16rem" }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-[#E89B5F] blur-2xl"
          />
          {/* Bright lamp line */}
          <motion.div
            initial={{ width: "15rem" }}
            whileInView={{ width: "30rem" }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-[#E89B5F]"
          />

          {/* Top cover to mask the cones above the line */}
          <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-[#0D0D0D]" />
        </div>
      </div>

      {/* ── Content (normal flow, never clipped) ── */}
      <div className="relative z-50 flex flex-col items-center justify-center min-h-dvh text-white pt-44 pb-16 px-4">
        <div className="text-center max-w-5xl mx-auto w-full">
          <div className="space-y-1 mb-6">
            <h1 className="text-[2rem] sm:text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-br from-slate-100 to-slate-400 bg-clip-text text-transparent animate-fade-in-up animation-delay-200 leading-tight">
              {headline.line1}
            </h1>
            <h1 className="text-[2rem] sm:text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-br from-slate-100 to-slate-400 bg-clip-text text-transparent animate-fade-in-up animation-delay-400 leading-tight">
              {headline.line2}
            </h1>
            {headline.line3 && (
              <h1 className="text-[2rem] sm:text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-br from-slate-100 to-slate-400 bg-clip-text text-transparent animate-fade-in-up animation-delay-600 leading-tight">
                {headline.line3}
              </h1>
            )}
          </div>

          <div className="max-w-3xl mx-auto animate-fade-in-up animation-delay-600 mb-8">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300/90 font-light leading-relaxed">
              {subtitle}
            </p>
          </div>

          {buttons && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-800">
              {buttons.primary && (
                <button
                  onClick={buttons.primary.onClick}
                  className="px-8 py-4 bg-[#C87941] hover:bg-[#b06830] text-white rounded-[6px] font-bold text-base sm:text-lg transition-colors duration-200"
                >
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button
                  onClick={buttons.secondary.onClick}
                  className="px-8 py-4 bg-[#C87941] hover:bg-[#b06830] text-white rounded-[6px] font-bold text-base sm:text-lg transition-colors duration-200"
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}

          {note && (
            <p className="text-xs sm:text-sm text-slate-400/60 animate-fade-in-up animation-delay-800 mt-3">
              {note}
            </p>
          )}
        </div>

        {identity && (
          <div className="mt-10 pt-6 border-t border-white/10 animate-fade-in-up animation-delay-800 text-center">
            <p className="text-base sm:text-xl font-bold text-white mb-1">{identity.name}</p>
            <p className="text-xs sm:text-sm text-slate-400">{identity.title}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LampHero;
