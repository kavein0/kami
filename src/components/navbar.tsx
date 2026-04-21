"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Search, User, LogOut, List, Menu, X,
  Home, Sparkles, Loader2,
} from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { setLanguage } from "@/app/actions/preferences";
import { GlobalSearch } from "./global-search";
import { getRandomTitleAction } from "@/app/actions/titles";

interface NavUser {
  name: string | null;
  image: string | null;
}

interface NavbarProps {
  lang: string;
  dict: Record<string, string>;
  user: NavUser | null;
}

// ── Stagger helper — transition is a separate prop, avoids Easing type issues ─
const hiddenStagger = { opacity: 0, x: -12 };
const visibleStagger = { opacity: 1, x: 0 };
function staggerTransition(i: number) {
  return { delay: i * 0.05, duration: 0.28 };
}

// ── Static Variants (no custom resolver) ─────────────────────────────
const mobileMenuVariants: Variants = {
  hidden:  { opacity: 0, height: 0, y: -8 },
  visible: { opacity: 1, height: "auto", y: 0, transition: { duration: 0.32, ease: "easeOut" } },
  exit:    { opacity: 0, height: 0, y: -8, transition: { duration: 0.22, ease: "easeIn" } },
};

const headerVariants: Variants = {
  hidden:  { y: -80, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.65, ease: "easeOut" } },
};

export function Navbar({ lang, dict, user }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [isPendingLang,   startTransitionLang]   = useTransition();
  const [isPendingRandom, startTransitionRandom] = useTransition();

  const handleRandomClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransitionRandom(async () => { await getRandomTitleAction(); });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const navLinks = [
    { href: "/",        label: dict.home,    icon: Home },
    { href: "/browse",  label: dict.catalog, icon: Search },
    { href: "/feed",    label: dict.feed,    icon: Sparkles },
    { href: "/my-list", label: dict.myList,  icon: List },
  ];

  // All mobile items in one flat list for stagger index
  const mobileItems = [
    ...navLinks.map((l, i) => ({ type: "link" as const, ...l, idx: i })),
    { type: "lang" as const, idx: navLinks.length },
    ...(user
      ? [
          { type: "profile" as const, idx: navLinks.length + 1 },
          { type: "logout"  as const, idx: navLinks.length + 2 },
        ]
      : [{ type: "login" as const, idx: navLinks.length + 1 }]),
  ];

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 right-0 z-50"
    >
      {/* Universal protection scrim: Ensures text is always readable over any hero banner */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-dark-bg/50 to-transparent pointer-events-none -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        {/* ── Floating island ───────────────────────────────── */}
        <motion.div
          animate={{
            borderRadius: scrolled ? "1rem" : "1.25rem",
            boxShadow: scrolled
              ? "0 8px 40px rgba(0,0,0,0.6),0 0 0 1px rgba(0,240,255,0.06),inset 0 1px 0 rgba(255,255,255,0.05)"
              : "none",
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`transition-colors duration-500 ${scrolled ? "nav-island px-4" : "bg-transparent px-0"}`}
        >
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <motion.button
                onClick={handleRandomClick}
                disabled={isPendingRandom}
                whileHover={{ rotate: 180, scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                animate={isPendingRandom
                  ? { rotate: 360, filter: ["blur(0px)", "blur(2px)", "blur(0px)"] }
                  : { rotate: 0 }}
                transition={isPendingRandom
                  ? { repeat: Infinity, duration: 0.9, ease: "linear" }
                  : { type: "spring", stiffness: 300, damping: 18 }}
                className="relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 rounded-full"
                aria-label="Random title"
              >
                <Sparkles className={`w-6 h-6 transition-colors ${isPendingRandom ? "text-neon-pink" : "text-neon-cyan"}`} />
                {isPendingRandom && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.5 }}
                    className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-md"
                  />
                )}
              </motion.button>

              <Link
                href="/"
                className="text-[1.15rem] font-extrabold font-heading bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent hover:opacity-80 transition-opacity tracking-tight"
              >
                MiruVerse
              </Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                      isActive ? "text-neon-cyan" : "text-white/80 hover:text-white"
                    }`}
                  >
                    <link.icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 shadow-[inset_0_0_12px_rgba(0,240,255,0.05)]"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-2">
              <GlobalSearch />
              <motion.button
                onClick={() => startTransitionLang(() => setLanguage(lang === "ru" ? "en" : "ru"))}
                disabled={isPendingLang}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="flex items-center justify-center font-bold text-[11px] w-8 h-8 rounded-full border border-dark-border text-white/80 hover:text-neon-cyan hover:border-neon-cyan/50 transition-colors bg-black/20"
                aria-label={`Switch to ${lang === "ru" ? "English" : "Russian"}`}
              >
                {isPendingLang
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin text-neon-cyan" />
                  : lang.toUpperCase()}
              </motion.button>

              {user ? (
                <>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-white/80 hover:text-white transition-colors">
                      <User className="w-4 h-4" aria-hidden="true" />
                      <span className="max-w-[100px] truncate">{user.name || dict.profile}</span>
                    </Link>
                  </motion.div>
                  <form action={logoutAction}>
                    <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-white/80 hover:text-neon-pink transition-colors">
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      {dict.logout}
                    </motion.button>
                  </form>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link href="/login"
                    className="shimmer-border relative px-5 py-2 rounded-xl text-sm font-semibold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:border-neon-cyan/50 hover:bg-neon-cyan/15 transition-all duration-300">
                    {dict.login}
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Mobile hamburger */}
            <motion.button
              onClick={() => setMenuOpen((v) => !v)}
              animate={{ rotate: menuOpen ? 90 : 0 }}
              className="md:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-dark-hover transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span key="x" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Mobile dropdown ───────────────────────────────── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden overflow-hidden mt-2"
            >
              <div className="nav-island rounded-2xl p-3 space-y-1">
                {/* Nav links */}
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={hiddenStagger}
                    animate={visibleStagger}
                    transition={staggerTransition(i)}
                  >
                    <Link href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                        pathname === link.href
                          ? "text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20"
                          : "text-dark-muted hover:text-dark-text hover:bg-dark-hover"
                      }`}>
                      <link.icon className="w-4 h-4" aria-hidden="true" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="border-t border-dark-border/60 pt-2 mt-2 space-y-1">
                  {/* Language */}
                  <motion.button
                    initial={hiddenStagger}
                    animate={visibleStagger}
                    transition={staggerTransition(navLinks.length)}
                    onClick={() => startTransitionLang(() => setLanguage(lang === "ru" ? "en" : "ru"))}
                    disabled={isPendingLang}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-muted hover:text-neon-cyan w-full text-left text-sm"
                  >
                    <span className="font-bold w-4 h-4 flex items-center justify-center text-[11px]">
                      {isPendingLang ? <Loader2 className="w-3.5 h-3.5 animate-spin text-neon-cyan" /> : lang.toUpperCase()}
                    </span>
                    Language / Язык
                  </motion.button>

                  {user ? (
                    <>
                      <motion.div initial={hiddenStagger} animate={visibleStagger} transition={staggerTransition(navLinks.length + 1)}>
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-muted hover:text-dark-text text-sm">
                          <User className="w-4 h-4" aria-hidden="true" />
                          {dict.profile}
                        </Link>
                      </motion.div>
                      <motion.div initial={hiddenStagger} animate={visibleStagger} transition={staggerTransition(navLinks.length + 2)}>
                        <form action={logoutAction}>
                          <button type="submit" className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-muted hover:text-neon-pink w-full text-left text-sm">
                            <LogOut className="w-4 h-4" aria-hidden="true" />
                            {dict.logout}
                          </button>
                        </form>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div initial={hiddenStagger} animate={visibleStagger} transition={staggerTransition(navLinks.length + 1)}>
                      <Link href="/login"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg font-semibold text-sm">
                        {dict.login}
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
