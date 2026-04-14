"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Tv, Film, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { TitleData } from "@/lib/types";
import { useDictionary } from "./dictionary-provider";
import { NEON_BLUR_BASE64 } from "@/lib/image-utils";

interface Props {
  title: TitleData;
  index: number;
}

export function TitleListItem({ title, index }: Props) {
  const dict = useDictionary();
  const router = useRouter();
  const TypeIcon = title.type === "anime" ? Tv : Film;
  const genres = title.genres.split(",").slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ x: 5 }}
      className="group"
    >
      <Link 
        href={`/title/${title.id}`} 
        className="block"
        onMouseEnter={() => router.prefetch(`/title/${title.id}`)}
      >
        <div className="flex gap-4 p-3 rounded-2xl bg-dark-card border border-dark-border hover:border-neon-cyan/30 shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-300 overflow-hidden">
          {/* Poster Section */}
          <div className="relative w-24 sm:w-32 aspect-[2/3] shrink-0 overflow-hidden rounded-xl">
            {title.poster ? (
              <Image
                src={title.poster}
                alt={title.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                placeholder="blur"
                blurDataURL={NEON_BLUR_BASE64}
              />
            ) : (
              <div className="w-full h-full bg-dark-surface" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 to-transparent" />
          </div>

          {/* Info Section */}
          <div className="flex flex-col flex-1 py-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <h3 className="font-bold text-lg text-white group-hover:text-neon-cyan transition-colors line-clamp-1">
                  {title.name}
                </h3>
                {title.nameEn && (
                  <p className="text-xs text-dark-muted line-clamp-1 truncate uppercase tracking-tight">
                    {title.nameEn}
                  </p>
                )}
              </div>
              
              {title.rating && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg glass-strong shrink-0">
                  <Star className="w-3.5 h-3.5 text-neon-yellow fill-neon-yellow" />
                  <span className="text-sm font-bold text-neon-yellow">{title.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-neon-cyan uppercase tracking-wider bg-neon-cyan/5 px-2 py-0.5 rounded-md border border-neon-cyan/10">
                <TypeIcon className="w-3 h-3" />
                {title.type}
              </span>
              {title.year && (
                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-dark-muted bg-dark-surface px-2 py-0.5 rounded-md border border-dark-border">
                  <Calendar className="w-3 h-3" />
                  {title.year}
                </span>
              )}
              {title.episodes && (
                <span className="text-[10px] sm:text-xs text-dark-muted bg-dark-surface px-2 py-0.5 rounded-md border border-dark-border">
                  {title.episodes} {dict.list.progress}
                </span>
              )}
            </div>

            {/* Description (List view highlight) */}
            {title.description && (
              <p className="text-xs sm:text-sm text-dark-muted line-clamp-2 md:line-clamp-3 mb-3 pr-4 mb-auto">
                {title.description}
              </p>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mt-auto">
              {genres.map(g => {
                const clean = g.trim();
                if (!clean) return null;
                const localized = dict.genres[clean] || clean;
                return (
                  <span key={clean} className="text-[10px] font-medium text-dark-muted bg-dark-bg px-2 py-0.5 rounded-full border border-dark-border">
                    {localized}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
