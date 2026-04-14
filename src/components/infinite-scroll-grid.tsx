"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TitleCard } from "./title-card";
import { TitleListItem } from "./title-list-item";
import { SkeletonCard, SkeletonListItem } from "./skeleton-card";
import { TitleData } from "@/lib/types";
import { loadMoreTitles } from "@/app/actions/browse";
import { useDictionary } from "./dictionary-provider";
import { ViewModeToggle } from "./view-mode-toggle";

const PAGE_SIZE = 20;

interface Props {
  initialTitles: TitleData[];
  q?: string;
  tab?: string;
  genre?: string;
  year?: string;
  sort?: string;
}

export function InfiniteScrollGrid({ initialTitles, q, tab, genre, year, sort }: Props) {
  const dict = useDictionary();
  const [titles, setTitles] = useState<TitleData[]>(initialTitles);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTitles.length >= PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const pageRef = useRef(1);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  // Initialize viewMode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("miruverse_view_mode") as "grid" | "list";
    if (saved) setViewMode(saved);
  }, []);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("miruverse_view_mode", mode);
  };

  useEffect(() => {
    // Reset state if filters change
    setTitles(initialTitles);
    pageRef.current = 1;
    setHasMore(initialTitles.length >= PAGE_SIZE);
    isFetchingRef.current = false; // Reset fetching flag to allow new loads
  }, [initialTitles, q, tab, genre, year, sort]);

  const fetchMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    setIsLoading(true);
    isFetchingRef.current = true;
    const nextPage = pageRef.current + 1;
    try {
      const moreTitles = await loadMoreTitles({
        page: nextPage,
        q,
        tab,
        genre,
        year,
        sort
      });

      if (moreTitles.length === 0) {
        setHasMore(false);
      } else {
        if (moreTitles.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setTitles((prev) => {
          const existingIds = new Set(prev.map(t => t.id));
          const uniques = moreTitles.filter(t => !existingIds.has(t.id));
          if (uniques.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...uniques];
        });
        pageRef.current = nextPage;
      }
    } catch (e) {
      console.error(e);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [q, tab, genre, year, sort, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetchingRef.current) {
          fetchMore();
        }
      },
      { rootMargin: '600px' }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }
    return () => observer.disconnect();
  }, [fetchMore, isLoading, hasMore]);

  if (titles.length === 0) {
    return (
      <div className="text-center py-20 bg-dark-card/30 rounded-3xl border border-dark-border mt-8">
        <div className="text-6xl mb-4 grayscale opacity-50">🔍</div>
        <h3 className="text-xl font-semibold text-dark-text mb-2">
          {dict.browse.emptyState}
        </h3>
        <p className="text-dark-muted">
          {dict.browse.emptyDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* List controls */}
      <div className="flex justify-end pr-1">
        <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {titles.map((title, i) => (
            <TitleCard key={`${title.id}-${i}`} title={title} index={i} />
          ))}
          {isLoading && [...Array(12)].map((_, i) => (
            <SkeletonCard key={`skel-${i}`} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {titles.map((title, i) => (
            <TitleListItem key={`${title.id}-${i}`} title={title} index={i} />
          ))}
          {isLoading && [...Array(6)].map((_, i) => (
            <SkeletonListItem key={`skel-list-${i}`} />
          ))}
        </div>
      )}
      
      {hasMore && (
        <div ref={observerTarget} className="h-10 invisible" />
      )}
    </div>
  );
}
