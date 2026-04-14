"use client";

import { LayoutGrid, List } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: Props) {
  return (
    <div className="flex items-center bg-dark-surface p-1 rounded-xl border border-dark-border">
      <button
        onClick={() => onViewModeChange("grid")}
        className={`relative p-2 rounded-lg transition-colors ${
          viewMode === "grid" ? "text-neon-cyan" : "text-dark-muted hover:text-dark-text"
        }`}
        title="Grid View"
      >
        {viewMode === "grid" && (
          <motion.div
            layoutId="view-toggle"
            className="absolute inset-0 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <LayoutGrid className="w-4 h-4 relative z-10" />
      </button>

      <button
        onClick={() => onViewModeChange("list")}
        className={`relative p-2 rounded-lg transition-colors ${
          viewMode === "list" ? "text-neon-cyan" : "text-dark-muted hover:text-dark-text"
        }`}
        title="List View"
      >
        {viewMode === "list" && (
          <motion.div
            layoutId="view-toggle"
            className="absolute inset-0 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <List className="w-4 h-4 relative z-10" />
      </button>
    </div>
  );
}
