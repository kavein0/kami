"use client";

import { motion } from "framer-motion";

type DustParticle = {
  left: string;
  top: string;
  duration: number;
  delay: number;
};

export function BackgroundEffects() {
  const particles: DustParticle[] = Array.from({ length: 60 }, (_, i) => ({
    left: `${(i * 13) % 100}%`,
    top: `${(i * 29) % 100}%`,
    duration: 15 + (i % 8) * 3,
    delay: (i % 12) * 1.2,
  }));

  // Premium organic animations (unused, removed spheres)
  // const sphereVariants = { ... }

  return (
    <>
      {/* Noise grain overlay — pure CSS, no JS, zero perf cost */}
      <div className="noise-overlay" aria-hidden="true" />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-dark-bg">
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0 opacity-20 bg-gradient-to-tr from-neon-pink via-neon-purple to-dark-bg mix-blend-screen"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ backgroundSize: "200% 200%" }}
        />

        {/* Grid */}
        <div className="absolute inset-0 bg-grid opacity-[0.06] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

        {/* Subtle floating dust particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px rounded-full bg-white/70"
            style={{ left: p.left, top: p.top }}
            animate={{ y: [0, -150, 0], opacity: [0, 0.8, 0], scale: [0, 2, 0] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear", delay: p.delay }}
          />
        ))}

        {/* Edge vignette to ground the background */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-dark-bg opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-transparent to-dark-bg opacity-40" />
      </div>
    </>
  );
}
