"use client";

import { motion } from "framer-motion";

export function SkeletonCard() {
  return (
    <div className="h-full flex flex-col relative rounded-2xl bg-dark-card/50 border border-dark-border/50 overflow-hidden shadow-lg">
      {/* Poster Skeleton */}
      <div className="relative aspect-[2/3] bg-dark-surface/50 animate-pulse">
        <div className="absolute inset-0 bg-linear-to-t from-dark-bg/40 to-transparent" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1 glass-strong m-2 rounded-xl mt-[-20px] relative z-10 space-y-3">
        {/* Title line */}
        <div className="h-5 w-3/4 bg-dark-surface rounded-md animate-pulse" />
        {/* Subtitle line */}
        <div className="h-3 w-1/2 bg-dark-surface/60 rounded-md animate-pulse" />
        
        {/* Badges line */}
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-12 bg-neon-cyan/5 rounded-md animate-pulse border border-neon-cyan/10" />
          <div className="h-5 w-16 bg-dark-surface rounded-md animate-pulse" />
        </div>

        {/* Genres line */}
        <div className="flex gap-1 mt-auto pt-2">
          <div className="h-4 w-10 bg-dark-surface/40 rounded-full animate-pulse" />
          <div className="h-4 w-12 bg-dark-surface/40 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
