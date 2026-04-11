"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  User,
  LogOut,
  List,
  Menu,
  X,
  Home,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { logoutAction, setLanguage } from "@/app/actions";
import { GlobalSearch } from "./global-search";

export function Navbar({ lang, dict }: { lang: string, dict: Record<string, string> }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState<{ user?: { name?: string | null; email?: string | null } } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (s?.user) setSession(s);
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: dict.nav.home, icon: Home },
    { href: "/browse", label: dict.nav.catalog, icon: Search },
    { href: "/feed", label: dict.nav.feed, icon: Sparkles },
    { href: "/my-list", label: dict.nav.myList, icon: List },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-strong shadow-lg shadow-black/20"
          : "bg-gradient-to-b from-dark-bg/80 via-dark-bg/40 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-7 h-7 text-neon-cyan" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
              KamiList
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "text-neon-cyan"
                      : "text-dark-muted hover:text-dark-text"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-neon-cyan/10 rounded-xl border border-neon-cyan/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3 relative">
            <GlobalSearch />
            <button
               onClick={() => setLanguage(lang === 'ru' ? 'en' : 'ru')}
               className="flex items-center justify-center font-bold text-xs w-8 h-8 rounded-full border border-dark-border text-dark-muted hover:text-neon-cyan hover:border-neon-cyan transition-colors"
            >
               {lang.toUpperCase()}
            </button>
            {session?.user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-dark-muted hover:text-dark-text transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{session.user.name || dict.profile}</span>
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-dark-muted hover:text-neon-pink transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {dict.logout}
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg hover:opacity-90 transition-opacity"
              >
                {dict.login}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-dark-muted"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong rounded-2xl mb-4 p-4 space-y-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  pathname === link.href
                    ? "text-neon-cyan bg-neon-cyan/10"
                    : "text-dark-muted hover:text-dark-text hover:bg-dark-hover"
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            <div className="border-t border-dark-border pt-2 mt-2">
              <button
                 onClick={() => setLanguage(lang === 'ru' ? 'en' : 'ru')}
                 className="flex mb-2 items-center gap-3 px-4 py-3 rounded-xl text-dark-muted hover:text-neon-cyan w-full text-left"
              >
                <span className="font-bold w-5 h-5 flex items-center">{lang.toUpperCase()}</span>
                Language / Язык
              </button>
              {session?.user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-muted hover:text-dark-text"
                  >
                    <User className="w-5 h-5" />
                    {dict.profile}
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-muted hover:text-neon-pink w-full text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      {dict.logout}
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg font-medium"
                >
                  {dict.login}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
