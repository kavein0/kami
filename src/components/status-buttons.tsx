"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye as EyeIcon,
  Play as PlayIcon,
  Clock as ClockIcon,
  Pause as PauseIcon,
  X as XIcon,
  ChevronDown as ChevronDownIcon,
  Check as CheckIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { addToList } from "@/app/actions/list";
import type { ListStatus } from "@/lib/types";
import { useDictionary } from "./dictionary-provider";
import toast from "react-hot-toast";

interface StatusButtonsProps {
  titleId: string;
  currentStatus?: string | null;
}

export function StatusButtons({ titleId, currentStatus }: StatusButtonsProps) {
  const dict = useDictionary();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const statuses: { value: ListStatus; label: string; icon: LucideIcon; color: string }[] = [
    { value: "watched", label: dict.list.completed, icon: EyeIcon, color: "text-neon-cyan" },
    { value: "watching", label: dict.list.watching, icon: PlayIcon, color: "text-neon-green" },
    { value: "plan_to_watch", label: dict.list.planned, icon: ClockIcon, color: "text-neon-yellow" },
    { value: "on_hold", label: dict.list.onHold, icon: PauseIcon, color: "text-neon-purple" },
    { value: "dropped", label: dict.list.dropped, icon: XIcon, color: "text-neon-pink" },
  ];

  const current = statuses.find((s) => s.value === currentStatus);

  const handleStatusChange = (status: ListStatus) => {
    const label = statuses.find((s) => s.value === status)?.label || status;
    startTransition(async () => {
      try {
        await addToList(titleId, status);
        toast.success(label);
        setIsOpen(false);
      } catch {
        toast.error(dict.common.error);
      }
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${
          current
            ? "glass border border-dark-border " + current.color
            : "bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-bg"
        } ${isPending ? "opacity-50" : ""}`}
      >
        {current ? (
          <>
            <CheckIcon className="w-4 h-4" />
            {current.label}
          </>
        ) : (
          <>{dict.details.saveToList || "Add to List"}</>
        )}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 rounded-2xl glass-strong border border-dark-border shadow-2xl overflow-hidden z-50"
          >
            {statuses.map((status) => {
              const Icon = status.icon;
              const isActive = currentStatus === status.value;
              return (
                <button
                  key={status.value}
                  onClick={() => handleStatusChange(status.value)}
                  disabled={isPending}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-all ${
                    isActive
                      ? "bg-dark-surface " + status.color
                      : "text-dark-muted hover:text-dark-text hover:bg-dark-hover"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {status.label}
                  {isActive && <CheckIcon className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
