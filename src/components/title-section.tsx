"use client";

import { motion } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { TitleCard } from "./title-card";
import { useRef, useState, useEffect } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth * 0.8, behavior: "smooth" });
            }
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 z-10 p-2 rounded-full bg-dark-surface/80 backdrop-blur border border-dark-border text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-neon-cyan hover:text-black hidden md:flex hover:scale-110 shadow-xl shadow-black/50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6 pt-2 px-1 -mx-1"
        >
          {titles.map((t, i) => (
            <div key={t.id} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-shrink-0 snap-start">
              <TitleCard title={t} index={i} />
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth * 0.8, behavior: "smooth" });
            }
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 z-10 p-2 rounded-full bg-dark-surface/80 backdrop-blur border border-dark-border text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-neon-cyan hover:text-black hidden md:flex hover:scale-110 shadow-xl shadow-black/50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
