"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TitleCard } from "./title-card";
import { TitleData } from "@/lib/types";
import { loadMoreTitles } from "@/app/actions/browse";
import { useDictionary } from "./dictionary-provider";

const PAGE_SIZE = 24;

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

  const pageRef = useRef(1);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Reset state if initialTitles changes (e.g. user typed a new search)
    setTitles(initialTitles);
    pageRef.current = 1;
    setHasMore(initialTitles.length >= PAGE_SIZE);
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
        // If we got fewer than a full page, this is the last page
        if (moreTitles.length < PAGE_SIZE) {
          setHasMore(false);
        }

        setTitles((prev) => {
          // Deduplicate based on title id to prevent infinite scroll bugs
          const existingIds = new Set(prev.map(t => t.id));
          const uniques = moreTitles.filter(t => !existingIds.has(t.id));

          // If all returned items are duplicates, stop loading
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
      { rootMargin: '400px' }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }
    return () => observer.disconnect();
  }, [fetchMore, isLoading, hasMore]);

  if (titles.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
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
    <div className="mt-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {titles.map((title, i) => (
          <TitleCard key={`${title.id}-${i}`} title={title} index={i} />
        ))}
      </div>
      
      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-10 mt-4">
          {isLoading && (
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-full h-full border-4 border-dark-border border-t-neon-cyan rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
