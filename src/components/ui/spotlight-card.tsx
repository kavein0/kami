"use client";

import { useRef, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * SpotlightCard — 21st.dev style card with mouse-tracking radial spotlight effect.
 * Uses CSS custom properties for zero-JS-paint-cost gradient positioning.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(0, 240, 255, 0.12)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    cardRef.current.style.setProperty("--spotlight-color", spotlightColor);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--mouse-x", `-9999px`);
    cardRef.current.style.setProperty("--mouse-y", `-9999px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("spotlight-card", className)}
    >
      {children}
    </div>
  );
}
