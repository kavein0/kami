"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function BackgroundEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden bg-dark-bg">
      {/* Texture Layer */}
      <div className="noise-overlay" />
      
      {/* Grid Layer */}
      <div className="absolute inset-0 bg-grid opacity-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      {/* Floating Mesh Blobs */}
      <div className="absolute inset-0">
        {/* Top Left - Cyan */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-neon-cyan blur-3xl-plus animate-drift"
        />
        
        {/* Bottom Right - Pink */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.12 }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-neon-pink blur-3xl-plus animate-drift-reverse"
        />

        {/* Middle Left - Purple */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          className="absolute top-[40%] -left-[5%] w-[35%] h-[35%] rounded-full bg-neon-purple blur-3xl-plus animate-drift"
          style={{ animationDelay: '-10s' }}
        />
      </div>

      {/* Subtle Floating Dust Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.4, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            }}
          />
        ))}
      </div>

      {/* Edge vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-dark-bg opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-transparent to-dark-bg opacity-40" />
    </div>
  );
}
