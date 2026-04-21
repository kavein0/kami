"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
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

// ─── Variants (outside component for stable reference) ────────────
const sectionVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const headerVariants: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const navBtnVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export function TitleSection({ title, icon, titles, href }: TitleSectionProps) {
  const dict = useDictionary();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 3,
    containScroll: "trimSnaps",
    breakpoints: { "(max-width: 768px)": { slidesToScroll: 2 } },
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    queueMicrotask(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="py-8"
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <motion.div variants={headerVariants} className="flex items-center gap-3">
          {/* Animated icon wrapper */}
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-dark-text tracking-tight">
            {title}
          </h2>
        </motion.div>

        {href && (
          <motion.div variants={headerVariants}>
            <Link
              href={href}
              className="group flex items-center gap-1 text-sm text-dark-muted hover:text-neon-cyan transition-colors duration-200 font-medium"
            >
              {dict.browse.viewAll}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </motion.span>
            </Link>
          </motion.div>
        )}
      </div>

      {/* ── Carousel ─────────────────────────────────────── */}
      <div className="relative group">
        <AnimatePresence>
          {canScrollPrev && (
            <motion.button
              suppressHydrationWarning
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3 }}
              onClick={scrollPrev}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-5 z-10 p-2 rounded-full bg-dark-surface/90 backdrop-blur border border-dark-border text-white hidden md:flex shadow-xl shadow-black/60 group-hover:opacity-100 hover:bg-neon-cyan hover:text-dark-bg hover:border-neon-cyan transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="overflow-hidden pb-6 pt-2 px-1 -mx-1" ref={emblaRef}>
          <div
            className="flex gap-4 sm:gap-5"
            style={{ touchAction: "pan-y pinch-zoom" }}
          >
            {titles.map((t, i) => (
              <div
                key={t.id}
                className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-shrink-0 min-w-0"
              >
                <TitleCard title={t} index={i} />
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {canScrollNext && (
            <motion.button
              suppressHydrationWarning
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3 }}
              onClick={scrollNext}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-5 z-10 p-2 rounded-full bg-dark-surface/90 backdrop-blur border border-dark-border text-white hidden md:flex shadow-xl shadow-black/60 group-hover:opacity-100 hover:bg-neon-cyan hover:text-dark-bg hover:border-neon-cyan transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
