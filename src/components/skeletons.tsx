"use client";

import { motion } from "framer-motion";

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-dark-card border border-dark-border">
      <div className="aspect-[2/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="flex gap-2">
          <div className="h-5 w-16 skeleton rounded-full" />
          <div className="h-5 w-12 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative w-full min-h-[85vh] bg-dark-card">
      <div className="absolute bottom-0 left-0 right-0 p-16 space-y-4">
        <div className="h-4 w-32 skeleton" />
        <div className="h-12 w-96 max-w-full skeleton" />
        <div className="h-6 w-48 skeleton" />
        <div className="h-20 w-[500px] max-w-full skeleton" />
        <div className="h-12 w-40 skeleton rounded-2xl" />
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6"
      >
        {/* Animated logo */}
        <div className="relative w-20 h-20 mx-auto">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-neon-cyan/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-neon-pink/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-neon-purple/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-neon-cyan">K</span>
          </div>
        </div>
        <p className="text-dark-muted text-sm animate-pulse">Загрузка...</p>
      </motion.div>
    </div>
  );
}
