"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { TitleCard } from "./title-card";
import { TitleData } from "@/lib/types";
import { loadMoreTitles } from "@/app/actions";
import { useDictionary } from "./dictionary-provider";

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
  const [hasMore, setHasMore] = useState(initialTitles.length >= 20);

  const pageRef = useRef(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state if initialTitles changes (e.g. user typed a new search)
    setTitles(initialTitles);
    pageRef.current = 1;
    setHasMore(initialTitles.length >= 20);
  }, [initialTitles, q, tab, genre, year, sort]);

  const fetchMore = useCallback(async () => {
    setIsLoading(true);
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
        setTitles((prev) => [...prev, ...moreTitles]);
        pageRef.current = nextPage;
        if (moreTitles.length < 20) setHasMore(false);
      }
    } catch (e) {
      console.error(e);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [q, tab, genre, year, sort]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          fetchMore();
        }
      },
      { threshold: 1.0 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }
    return () => observer.disconnect();
  }, [fetchMore, isLoading]);

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
