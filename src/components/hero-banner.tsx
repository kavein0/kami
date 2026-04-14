"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Star, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import type { TitleData } from "@/lib/types";
import { useDictionary } from "./dictionary-provider";
import { NEON_BLUR_BASE64 } from "@/lib/image-utils";

interface HeroBannerProps {
  title: TitleData;
}

export function HeroBanner({ title }: HeroBannerProps) {
  const dict = useDictionary();
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative w-full min-h-[85vh] flex items-end overflow-hidden object-cover bg-dark-bg">
      {/* Background image with parallax effect */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <Image
          src={title.backdrop || title.poster || ""}
          alt={title.name}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
          placeholder="blur"
          blurDataURL={NEON_BLUR_BASE64}
        />
      </motion.div>

      {/* Gradient overlays for readability and glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/90 via-dark-bg/40 to-transparent w-full md:w-[70%]" />

      {/* Animated neon particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.8)]"
            style={{
              left: `${15 + Math.random() * 70}%`, // Randomized positioning to some degree
              top: `${20 + i * 15}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-32 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", damping: 20 }}
          >
            <div className="flex items-center gap-2 mb-4 glass inline-flex px-3 py-1 rounded-full border border-neon-cyan/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse-neon" />
              <span className="text-xs font-bold text-neon-cyan uppercase tracking-[0.2em]">
                {dict.home.recommendationOfDay || "Recommendation Of The Day"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-heading text-white leading-[1.1] mb-2">
              {title.name}
            </h1>

            {title.nameEn && (
              <p className="text-lg font-medium text-dark-muted mb-4 opacity-80">{title.nameEn}</p>
            )}

            <div className="flex items-center gap-4 mb-6 text-sm font-semibold">
              {title.rating && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-yellow/10 border border-neon-yellow/30 shadow-[0_0_10px_rgba(255,170,0,0.2)]">
                  <Star className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
                  <span className="text-neon-yellow">
                    {title.rating.toFixed(1)}
                  </span>
                </div>
              )}
              {title.year && (
                <span className="text-white/70 bg-white/5 px-2 py-1 rounded-md">{title.year}</span>
              )}
              {title.episodes && (
                <span className="text-white/70 bg-white/5 px-2 py-1 rounded-md">{title.episodes} {dict.list.progress}</span>
              )}
              {title.duration && (
                <span className="text-white/70 bg-white/5 px-2 py-1 rounded-md">{title.duration}</span>
              )}
            </div>

            <p className="text-dark-muted leading-relaxed mb-8 line-clamp-3 text-base md:text-lg max-w-xl text-balance">
              {title.description}
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={`/title/${title.id}`}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-heading tracking-wide bg-gradient-to-r from-neon-cyan to-blue-500 text-dark-bg font-bold text-sm lg:text-base hover:opacity-90 transition-all duration-300 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105"
              >
                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                {dict.home.heroDetails} {/* Since heroWatch usually implies "Add to list", we'll just link to Details for now to match UI */}
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
