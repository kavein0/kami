"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { TitleCard } from "./title-card";
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {titles.map((t, i) => (
          <TitleCard key={t.id} title={t} index={i} />
        ))}
      </div>
    </section>
  );
}
