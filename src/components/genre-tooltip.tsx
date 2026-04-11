"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useState } from "react";

interface GenreTooltipProps {
  children: ReactNode;
  description: string;
}

export function GenreTooltip({ children, description }: GenreTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex items-center justify-center cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute z-50 bottom-full mb-2 w-48 p-2 text-xs text-center text-dark-text bg-dark-card border border-dark-border rounded-lg shadow-xl shadow-black/50 pointer-events-none"
        >
          {description}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-dark-border" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[7px] border-x-transparent border-t-[7px] border-t-dark-card -mt-[1px]" />
        </motion.div>
      )}
    </div>
  );
}
