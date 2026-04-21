"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";

interface Genre {
  name: string;
  localized: string;
}

interface HomeGenreSectionProps {
  genres: Genre[];
  title: string;
}

// ─── Variants ──────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045, delayChildren: 0.1 },
  },
};

const headingVariants: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const chipVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.82, y: 12 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { type: "spring", stiffness: 340, damping: 22 },
  },
};

const footerVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

// Neon colors cycle for chip accents
const CHIP_COLORS = [
  "hover:text-neon-cyan  hover:border-neon-cyan/35  hover:shadow-[0_0_14px_rgba(0,240,255,0.18)]",
  "hover:text-neon-purple hover:border-neon-purple/35 hover:shadow-[0_0_14px_rgba(170,119,255,0.18)]",
  "hover:text-neon-pink  hover:border-neon-pink/35   hover:shadow-[0_0_14px_rgba(255,0,170,0.18)]",
  "hover:text-neon-green hover:border-neon-green/35  hover:shadow-[0_0_14px_rgba(0,255,136,0.18)]",
  "hover:text-neon-yellow hover:border-neon-yellow/35 hover:shadow-[0_0_14px_rgba(255,170,0,0.18)]",
];

export function HomeGenreSection({ genres, title }: HomeGenreSectionProps) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="py-12"
    >
      <motion.h2
        variants={headingVariants}
        className="text-2xl font-bold font-heading mb-7 flex items-center gap-3 text-dark-text"
      >
        <motion.span
          className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink flex-shrink-0"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        {title}
      </motion.h2>

      <div className="flex flex-wrap gap-3">
        {genres.map((g, i) => (
          <motion.div key={g.name} variants={chipVariants} whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={`/browse?tab=anime&genre=${g.name}`}
              className={`block px-5 py-2.5 rounded-2xl glass border border-dark-border/60 text-dark-muted text-sm font-semibold transition-all duration-250 ${
                CHIP_COLORS[i % CHIP_COLORS.length]
              }`}
            >
              {g.localized}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ── Animated Footer ────────────────────────────────────────────────
interface AnimatedFooterProps {
  year: number;
  rights: string;
  note: string;
}

export function AnimatedFooter({ year, rights, note }: AnimatedFooterProps) {
  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="border-t border-dark-border/40 py-10 text-center mt-16 relative z-10 glass-strong rounded-t-3xl border-b-0"
    >
      <motion.p
        className="text-dark-muted text-sm tracking-wide"
        whileHover={{ scale: 1.02 }}
      >
        © {year}{" "}
        <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent font-extrabold font-heading tracking-wider">
          MiruVerse
        </span>
        . {rights}
      </motion.p>
      <p className="text-dark-muted/40 text-[11px] mt-2 uppercase tracking-[0.25em] font-semibold">
        {note}
      </p>
    </motion.footer>
  );
}
