"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Star, Calendar } from "lucide-react";
import { useDictionary } from "./dictionary-provider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { NEON_BLUR_BASE64 } from "@/lib/image-utils";

export function GlobalSearch() {
  const dict = useDictionary();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch logic
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const fetchSearch = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.titles || []);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
  }, [debouncedQuery]);

  return (
    <div className="relative w-full max-w-sm hidden md:block" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-dark-muted group-focus-within:text-neon-cyan transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="block w-full pl-10 pr-3 py-2 bg-dark-bg/50 border border-dark-border rounded-full text-sm placeholder-dark-muted text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all font-sans"
          placeholder={dict.browse.searchPlaceholder || "Search anime, movies..."}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-4 w-4 text-neon-cyan animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-3 glass-strong border border-neon-cyan/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50 max-h-[70vh] flex flex-col"
          >
            <div className="overflow-y-auto w-full max-h-full scrollbar-thin">
              {results.length > 0 ? (
                <div className="flex flex-col p-2 gap-1">
                  {results.map((title) => (
                    <Link
                      key={title.id}
                      href={`/title/${title.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="relative h-16 w-12 flex-shrink-0 rounded-lg overflow-hidden border border-dark-border group-hover:border-neon-cyan/40">
                         {title.poster ? (
                           <Image
                             src={title.poster}
                             alt={title.name}
                             fill
                             sizes="48px"
                             className="object-cover"
                             placeholder="blur"
                             blurDataURL={NEON_BLUR_BASE64}
                           />
                         ) : (
                           <div className="w-full h-full bg-dark-surface" />
                         )}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-heading font-bold text-white truncate group-hover:text-neon-cyan transition-colors">
                          {title.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-dark-muted font-medium">
                          {title.year && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {title.year}
                            </span>
                          )}
                          {title.rating > 0 && (
                            <span className="flex items-center gap-1 text-neon-yellow">
                              <Star className="w-3 h-3 fill-neon-yellow" /> {title.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link 
                     href={`/browse?q=${encodeURIComponent(query)}`}
                     onClick={() => setIsOpen(false)}
                     className="w-full text-center py-3 text-xs font-bold text-neon-cyan hover:bg-neon-cyan/10 transition-colors mt-1 rounded-lg"
                  >
                     View all results
                  </Link>
                </div>
              ) : !isLoading ? (
                <div className="p-8 text-center text-dark-muted text-sm flex flex-col items-center gap-3">
                  <Search className="w-8 h-8 opacity-20" />
                  No results found for "{query}"
                </div>
              ) : (
                 <div className="p-8 flex justify-center">
                    <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
