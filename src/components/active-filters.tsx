"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDictionary } from "./dictionary-provider";

export function ActiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dict = useDictionary();

  const genre = searchParams.get("genre");
  const year = searchParams.get("year");
  const q = searchParams.get("q");

  if (!genre && !year && !q) return null;

  const genres = genre ? genre.split(",").filter(Boolean) : [];

  const removeGenre = (g: string) => {
    const nextGenres = genres.filter((item) => item !== g);
    const params = new URLSearchParams(searchParams.toString());
    if (nextGenres.length > 0) {
      params.set("genre", nextGenres.join(","));
    } else {
      params.delete("genre");
    }
    router.push(`/browse?${params.toString()}`, { scroll: false });
  };

  const removeParam = (p: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(p);
    router.push(`/browse?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.push("/browse?tab=" + (searchParams.get("tab") || "anime"), { scroll: false });
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4 items-center">
      <AnimatePresence>
        {q && (
          <FilterBadge 
            label={`${dict.browse.queryFor}: ${q}`} 
            onRemove={() => removeParam("q")} 
            variant="cyan"
          />
        )}
        {year && (
          <FilterBadge 
            label={`${dict.browse.filtersYear}: ${year}`} 
            onRemove={() => removeParam("year")} 
          />
        )}
        {genres.map((g) => (
          <FilterBadge 
            key={g} 
            label={dict.genres[g] || g} 
            onRemove={() => removeGenre(g)} 
          />
        ))}
      </AnimatePresence>
      
      {(genres.length > 0 || year || q) && (
        <button
          onClick={clearAll}
          className="text-xs text-dark-muted hover:text-neon-pink transition-colors ml-2 font-medium"
        >
          {dict.browse.clearAll || "Clear All"}
        </button>
      )}
    </div>
  );
}

function FilterBadge({ label, onRemove, variant = "default" }: { label: string; onRemove: () => void, variant?: "default" | "cyan" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
        variant === "cyan" 
          ? "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.1)]" 
          : "bg-dark-surface border-dark-border text-dark-text"
      }`}
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:text-neon-pink transition-colors"
        aria-label="Remove filter"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}
