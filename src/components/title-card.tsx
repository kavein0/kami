"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { Star, Calendar, Tv, Film } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { TitleData } from "@/lib/types";
import { useDictionary } from "./dictionary-provider";
import { NEON_BLUR_BASE64 } from "@/lib/image-utils";
import { SpotlightCard } from "./ui/spotlight-card";

interface TitleCardProps {
  title: TitleData;
  index?: number;
}

// ─── Animation Variants ────────────────────────────────────────────
// Defined OUTSIDE the component — stable reference, no re-creation on render
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: Math.min(i * 0.045, 0.5),
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Spring config for 3D tilt
const TILT_SPRING = { stiffness: 260, damping: 28, mass: 0.6 };
const MAX_TILT = 12; // degrees

export function TitleCard({ title, index = 0 }: TitleCardProps) {
  const dict = useDictionary();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const TypeIcon = title.type === "anime" ? Tv : Film;
  const genres = title.genres.split(",").slice(0, 2);

  // ─── 3D Tilt via useMotionValue + useSpring ───────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), TILT_SPRING);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), TILT_SPRING);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group/card h-full"
    >
      <Link
        href={`/title/${title.id}`}
        className="block h-full"
        onMouseEnter={() => router.prefetch(`/title/${title.id}`)}
        aria-label={title.name}
      >
        {/* 3D tilt wrapper */}
        <motion.div
          ref={cardRef}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="h-full"
        >
          {/* SpotlightCard — mouse-tracking border glow */}
          <SpotlightCard
            className="h-full flex flex-col relative rounded-2xl bg-dark-card border border-dark-border card-shine overflow-hidden transition-all duration-400"
            spotlightColor="rgba(0, 240, 255, 0.13)"
          >
            {/* Border glow on hover (CSS, no JS) */}
            <div className="absolute inset-0 rounded-2xl border border-neon-cyan/0 group-hover/card:border-neon-cyan/25 transition-colors duration-500 pointer-events-none z-10" />

            {/* Shadow lift */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
              }}
              whileHover={{
                boxShadow: "0 16px 48px rgba(0,0,0,0.7), 0 0 24px rgba(0,240,255,0.15)",
              }}
              transition={{ duration: 0.35 }}
            />

            {/* ── Poster ─────────────────────────────────────── */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-t-2xl flex-shrink-0">
              {title.poster ? (
                <Image
                  src={title.poster}
                  alt={title.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  className="object-cover transform group-hover/card:scale-108 transition-transform duration-700 ease-out"
                  placeholder="blur"
                  blurDataURL={NEON_BLUR_BASE64}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-dark-surface to-dark-bg group-hover/card:scale-108 transition-transform duration-700" />
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-card via-dark-card/40 to-transparent opacity-70 group-hover/card:opacity-85 transition-opacity duration-500" />

              {/* Type badge */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg glass text-[10px] font-bold uppercase tracking-widest text-neon-cyan flex items-center gap-1 z-20">
                <TypeIcon className="w-2.5 h-2.5" aria-hidden="true" />
                {title.type === "anime"
                  ? (dict.browse.tabAnime || "Anime")
                  : title.type === "movie"
                  ? (dict.browse.tabMovies || "Movie")
                  : (dict.browse.tabSeries || "Series")}
              </div>

              {/* Rating badge */}
              {title.rating && (
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg glass flex items-center gap-1 z-20">
                  <Star className="w-2.5 h-2.5 text-neon-yellow fill-neon-yellow" aria-hidden="true" />
                  <span className="text-[11px] font-bold text-neon-yellow">
                    {title.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* ── Info panel ─────────────────────────────────── */}
            <div className="p-3 flex flex-col flex-1 relative z-10">
              <h3 className="font-bold font-heading text-[0.9rem] text-dark-text leading-tight line-clamp-1 group-hover/card:text-neon-cyan transition-colors duration-300">
                {dict.lang === "en" ? (title.nameEn || title.name) : title.name}
              </h3>

              {/* Alt title (smaller language) */}
              {(dict.lang === "en" ? title.nameEn && title.name : title.nameEn) && (
                <p className="text-[10px] text-dark-muted line-clamp-1 mt-0.5 font-medium">
                  {dict.lang === "en" ? title.name : title.nameEn}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2 text-[10px] text-neon-cyan/75 font-semibold">
                {title.year && (
                  <span className="flex items-center gap-1 bg-neon-cyan/8 px-1.5 py-0.5 rounded-md border border-neon-cyan/15">
                    <Calendar className="w-2.5 h-2.5" aria-hidden="true" />
                    {title.year}
                  </span>
                )}
                {title.episodes && (
                  <span className="bg-dark-surface/80 px-1.5 py-0.5 rounded-md border border-dark-border text-dark-muted">
                    {title.episodes} {dict.list.progress}
                  </span>
                )}
              </div>

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto pt-2">
                  {genres.map((genre) => {
                    const clean = genre.trim();
                    if (!clean) return null;
                    const localized = dict.genres[clean] || clean;
                    return (
                      <span
                        key={clean}
                        className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-dark-bg text-dark-muted border border-dark-border/60 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
                      >
                        {localized}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </SpotlightCard>
        </motion.div>
      </Link>
    </motion.div>
  );
}
