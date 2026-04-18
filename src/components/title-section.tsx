"use client";

import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { TitleCard } from "./title-card";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { TitleData } from "@/lib/types";
import { useDictionary } from "./dictionary-provider";

interface TitleSectionProps {
  title: string;
  icon?: React.ReactNode;
  titles: TitleData[];
  href?: string;
}

export function TitleSection({ title, icon, titles, href }: TitleSectionProps) {
  const dict = useDictionary();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3"
        >
          {icon}
          <h2 className="text-xl sm:text-2xl font-bold text-dark-text">
            {title}
          </h2>
        </motion.div>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-sm text-dark-muted hover:text-neon-cyan transition-colors"
          >
            {dict.browse.viewAll}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      
      <div className="relative group">
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-10 p-2 rounded-full bg-dark-surface/80 backdrop-blur border border-dark-border text-white transition-all hover:bg-neon-cyan hover:text-black hidden md:flex hover:scale-110 shadow-xl shadow-black/50 ${
            !canScrollPrev ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="overflow-hidden pb-6 pt-2 px-1 -mx-1" ref={emblaRef}>
          <div className="flex gap-4 sm:gap-5" style={{ touchAction: 'pan-y pinch-zoom' }}>
            {titles.map((t, i) => (
              <div key={t.id} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-shrink-0 min-w-0">
                <TitleCard title={t} index={i} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-10 p-2 rounded-full bg-dark-surface/80 backdrop-blur border border-dark-border text-white transition-all hover:bg-neon-cyan hover:text-black hidden md:flex hover:scale-110 shadow-xl shadow-black/50 ${
            !canScrollNext ? "opacity-0 pointer-events-none" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
