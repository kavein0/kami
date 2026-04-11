"use client";

import { motion } from "framer-motion";
import { Star, Calendar, Play, Tv, Film } from "lucide-react";
import Link from "next/link";
import type { TitleData } from "@/lib/types";
import { useDictionary } from "./dictionary-provider";

interface TitleCardProps {
  title: TitleData;
  index?: number;
}

export function TitleCard({ title, index = 0 }: TitleCardProps) {
  const dict = useDictionary();
  const typeIcon = title.type === "anime" ? Tv : Film;
  const TypeIcon = typeIcon;
  const genres = title.genres.split(",").slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group"
    >
      <Link href={`/title/${title.id}`}>
        <div className="relative rounded-2xl overflow-hidden bg-dark-card border border-dark-border hover:border-neon-cyan/30 transition-all duration-500 card-shine">
          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
              style={{
                backgroundImage: title.poster
                  ? `url(${title.poster})`
                  : "linear-gradient(135deg, #1a1a2e, #12121a)",
              }}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Play button on hover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-neon-cyan/20 backdrop-blur-md border border-neon-cyan/40 flex items-center justify-center">
                <Play className="w-6 h-6 text-neon-cyan ml-1" />
              </div>
            </motion.div>

            {/* Type badge */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded-lg glass text-[10px] font-semibold uppercase tracking-wider text-neon-cyan flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {title.type === "anime" 
                ? (dict.browse.tabAnime || "Anime") 
                : title.type === "movie" 
                ? (dict.browse.tabMovies || "Movie") 
                : (dict.browse.tabSeries || "Series")}
            </div>

            {/* Rating badge */}
            {title.rating && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-lg glass flex items-center gap-1">
                <Star className="w-3 h-3 text-neon-yellow fill-neon-yellow" />
                <span className="text-xs font-bold text-neon-yellow">
                  {title.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-sm text-dark-text line-clamp-1 group-hover:text-neon-cyan transition-colors duration-300">
              {title.name}
            </h3>
            {title.nameEn && (
              <p className="text-xs text-dark-muted line-clamp-1">
                {title.nameEn}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-dark-muted">
              {title.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {title.year}
                </span>
              )}
              {title.episodes && (
                <span>• {title.episodes} {dict.list.progress}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {genres.map((genre) => {
                const clean = genre.trim();
                const localized = dict.genres[clean] || clean;
                return (
                  <span
                    key={clean}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-dark-surface text-dark-muted border border-dark-border"
                  >
                    {localized}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
