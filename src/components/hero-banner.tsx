"use client";

import { motion } from "framer-motion";
import { Star, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import type { TitleData } from "@/lib/types";
import { useDictionary } from "./dictionary-provider";

interface HeroBannerProps {
  title: TitleData;
}

export function HeroBanner({ title }: HeroBannerProps) {
  const dict = useDictionary();

  return (
    <section className="relative w-full min-h-[85vh] flex items-end overflow-hidden">
      {/* Background image with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: title.backdrop
            ? `url(${title.backdrop})`
            : `url(${title.poster})`,
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/70 to-dark-bg/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/80 via-transparent to-transparent" />

      {/* Animated neon particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-neon-cyan/40"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-16 pt-32 w-full">
        <div className="max-w-2xl">
          {/* Subtle gradient overlay behind text for readability as requested */}
          <div className="absolute inset-0 z-[-1] bg-gradient-to-r from-dark-bg/60 to-transparent blur-3xl pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse-neon" />
              <span className="text-sm font-medium text-neon-cyan uppercase tracking-[0.2em]">
                {dict.home.popularAnime || "Featured"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-2 neon-text-cyan">
              {title.name}
            </h1>

            {title.nameEn && (
              <p className="text-lg text-dark-muted mb-4">{title.nameEn}</p>
            )}

            <div className="flex items-center gap-4 mb-6 text-sm">
              {title.rating && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass">
                  <Star className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
                  <span className="font-bold text-neon-yellow">
                    {title.rating.toFixed(1)}
                  </span>
                </div>
              )}
              {title.year && (
                <span className="text-dark-muted">{title.year}</span>
              )}
              {title.episodes && (
                <span className="text-dark-muted">{title.episodes} {dict.list.progress}</span>
              )}
              {title.duration && (
                <span className="text-dark-muted">{title.duration}</span>
              )}
            </div>

            <p className="text-dark-muted leading-relaxed mb-8 line-clamp-3 text-base">
              {title.description}
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={`/title/${title.id}`}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg font-bold text-sm hover:opacity-90 transition-all duration-300 neon-glow-cyan"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {dict.home.heroWatch}
              </Link>
              <Link
                href={`/title/${title.id}`}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl glass border border-dark-border text-dark-text font-bold text-sm hover:bg-white/5 transition-all duration-300"
              >
                {dict.home.heroDetails}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-bg to-transparent" />
    </section>
  );
}
