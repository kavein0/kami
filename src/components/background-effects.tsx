"use client";

import { motion } from "framer-motion";

type DustParticle = {
  left: string;
  top: string;
  duration: number;
  delay: number;
};

export function BackgroundEffects() {
  const particles: DustParticle[] = Array.from({ length: 25 }, (_, i) => ({
    left: `${(i * 17) % 100}%`,
    top: `${(i * 29) % 100}%`,
    duration: 15 + (i % 6) * 3,
    delay: (i % 8) * 0.8,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none -z-1 overflow-hidden bg-dark-bg">
      {/* Grid Layer */}
      <div className="absolute inset-0 bg-grid opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

      {/* Floating Mesh Blobs */}
      <div className="absolute inset-0">
        {/* Top Left - Cyan */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.25 }}
          className="absolute -top-[15%] -left-[10%] w-[60%] h-[60%] rounded-full bg-neon-cyan blur-3xl-plus animate-drift"
        />
        
        {/* Bottom Right - Pink */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          className="absolute -bottom-[15%] -right-[10%] w-[60%] h-[60%] rounded-full bg-neon-pink blur-3xl-plus animate-drift-reverse"
        />

        {/* Middle Left - Purple */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="absolute top-[30%] -left-[10%] w-[45%] h-[45%] rounded-full bg-neon-purple blur-3xl-plus animate-drift"
          style={{ animationDelay: '-10s' }}
        />
      </div>

      {/* Subtle Floating Dust Particles */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/40 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [0, -150, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1.2, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear",
              delay: particle.delay,
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
