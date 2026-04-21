"use client";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Star, Play, Info, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import type { TitleData } from "@/lib/types";
import { useDictionary } from "./dictionary-provider";
import { NEON_BLUR_BASE64 } from "@/lib/image-utils";

interface HeroBannerProps {
  title: TitleData;
}

// ─── Animation Variants ────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 350, damping: 22 },
  },
};

const titleVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};

const wordVariants: Variants = {
  hidden:  { opacity: 0, y: 30, rotateX: -20 },
  visible: {
    opacity: 1, y: 0, rotateX: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};

const slideUpVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const buttonVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.9, y: 16 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 320, damping: 20 },
  },
};

// Deterministic particles from seed
const particles = Array.from({ length: 8 }, (_, i) => ({
  left:     `${10 + i * 11}%`,
  top:      `${15 + ((i * 19) % 60)}%`,
  duration: 5 + i * 0.8,
  delay:    i * 0.4,
  size:     i % 3 === 0 ? 2.5 : 1.5,
  color:    i % 3 === 0 ? "#00f0ff" : i % 3 === 1 ? "#aa77ff" : "#ff00aa",
}));

export function HeroBanner({ title }: HeroBannerProps) {
  const dict = useDictionary();
  const ref  = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY       = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY  = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentOp = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Split title into words for stagger reveal
  const displayName  = dict.lang === "en" ? (title.nameEn || title.name) : title.name;
  const words        = displayName.split(" ");

  return (
    <section
      ref={ref}
      className="relative w-full min-h-[90vh] flex items-end overflow-hidden bg-dark-bg"
      aria-label="Featured title"
    >
      {/* ── Parallax background ──────────────────────────── */}
      <motion.div
        style={{ y: bgY, opacity: bgOpacity }}
        className="absolute inset-0 w-full h-[115%] -top-[8%]"
      >
        {/* Blurred ambient backdrop */}
        <Image
          src={title.backdrop || title.poster || ""}
          alt=""
          fill
          priority
          sizes="100vw"
          aria-hidden="true"
          className="object-cover opacity-30 blur-3xl saturate-[1.6] scale-110"
        />
        {/* Main image */}
        <Image
          src={title.backdrop || title.poster || ""}
          alt={title.name}
          fill
          priority
          sizes="100vw"
          className={`transition-opacity duration-700 ${
            title.backdrop
              ? "object-cover opacity-55"
              : "object-contain object-right lg:object-[82%_top] opacity-45"
          }`}
          placeholder="blur"
          blurDataURL={NEON_BLUR_BASE64}
        />
      </motion.div>

      {/* ── Gradient overlays ────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/55 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/95 via-dark-bg/45 to-transparent md:w-[72%]" />

      {/* ── Neon particles ───────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top:  p.top,
              width:  p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 5}px ${p.color}`,
            }}
            animate={{ y: [0, -50, 0], opacity: [0.1, 0.7, 0.1], scale: [1, 1.6, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <motion.div
        style={{ y: contentY, opacity: contentOp }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24 pt-36 w-full"
      >
        <motion.div
          className="max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={badgeVariants}>
            <div className="inline-flex items-center gap-2 mb-5 glass px-3.5 py-1.5 rounded-full border border-neon-cyan/25 shadow-[0_0_20px_rgba(0,240,255,0.12)]">
              <Sparkles className="w-3.5 h-3.5 text-neon-cyan animate-pulse-neon" aria-hidden="true" />
              <span className="text-[11px] font-extrabold text-neon-cyan uppercase tracking-[0.25em]">
                {dict.home.recommendationOfDay}
              </span>
            </div>
          </motion.div>

          {/* Title — word-by-word reveal */}
          <motion.h1
            variants={titleVariants}
            className="text-4xl sm:text-5xl lg:text-[4.5rem] font-extrabold font-heading text-white leading-[1.05] mb-3"
            style={{ perspective: 1000 }}
          >
            {words.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                variants={wordVariants}
                className="inline-block mr-[0.25em] last:mr-0"
                style={{ display: "inline-block" }}
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Alt name */}
          {(dict.lang === "en" ? title.nameEn && title.name : title.nameEn) && (
            <motion.p variants={slideUpVariants} className="text-base font-medium text-dark-muted mb-4 opacity-75">
              {dict.lang === "en" ? title.name : title.nameEn}
            </motion.p>
          )}

          {/* Meta badges */}
          <motion.div variants={slideUpVariants} className="flex items-center flex-wrap gap-2 mb-5 text-sm font-semibold">
            {title.rating && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-neon-yellow/25 shadow-[0_0_12px_rgba(255,170,0,0.15)]">
                <Star className="w-3.5 h-3.5 text-neon-yellow fill-neon-yellow" aria-hidden="true" />
                <span className="text-neon-yellow">{title.rating.toFixed(1)}</span>
              </div>
            )}
            {title.year && (
              <span className="text-white/65 bg-white/6 px-2.5 py-1.5 rounded-lg border border-white/8 text-xs">
                {title.year}
              </span>
            )}
            {title.episodes && (
              <span className="text-white/65 bg-white/6 px-2.5 py-1.5 rounded-lg border border-white/8 text-xs">
                {title.episodes} {dict.list.progress}
              </span>
            )}
            {title.duration && (
              <span className="text-white/65 bg-white/6 px-2.5 py-1.5 rounded-lg border border-white/8 text-xs">
                {title.duration}
              </span>
            )}
          </motion.div>

          {/* Description */}
          <motion.p
            variants={slideUpVariants}
            className="text-dark-muted leading-relaxed mb-8 line-clamp-3 text-sm md:text-base max-w-xl text-balance"
          >
            {title.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={slideUpVariants} className="flex items-center gap-3 flex-wrap">
            {/* Primary — shimmer border */}
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href={`/title/${title.id}`}
                className="group shimmer-border inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-heading font-bold text-sm tracking-wide bg-neon-cyan text-dark-bg hover:opacity-90 transition-opacity shadow-[0_0_25px_rgba(0,240,255,0.45)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)]"
              >
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                </motion.span>
                {dict.home.heroWatch}
              </Link>
            </motion.div>

            {/* Secondary — glass */}
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href={`/title/${title.id}`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-heading font-semibold text-sm tracking-wide glass border border-white/10 text-dark-text hover:border-white/25 hover:bg-white/6 transition-all duration-300"
              >
                <Info className="w-4 h-4" aria-hidden="true" />
                {dict.home.heroDetails}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Bottom fades ─────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-dark-bg via-dark-bg/75 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-dark-bg pointer-events-none" />
    </section>
  );
}
