"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, List, User, Activity } from "lucide-react";
import { motion } from "framer-motion";
import type { Dictionary } from "@/lib/i18n";

const tabs = [
  { href: "/", icon: Home, label: "home" },
  { href: "/browse", icon: Search, label: "catalog" },
  { href: "/feed", icon: Activity, label: "feed" },
  { href: "/my-list", icon: List, label: "myList" },
  { href: "/profile", icon: User, label: "profile" },
] as const satisfies ReadonlyArray<{
  href: string;
  icon: typeof Home;
  label: keyof Dictionary["nav"];
}>;

export function MobileNav({ dict }: { dict: Dictionary["nav"] }) {
  const pathname = usePathname();

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 md:hidden glass-strong border-t border-dark-border ${pathname === "/login" || pathname === "/register" ? "hidden" : ""}`}>
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center gap-1 py-2 px-3"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNav"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <tab.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-neon-cyan" : "text-dark-muted"
                }`}
              />
              <span
                className={`text-[10px] transition-colors ${
                  isActive ? "text-neon-cyan" : "text-dark-muted"
                }`}
              >
                {dict[tab.label] || tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
