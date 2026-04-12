"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface FilterOption {
  label: string;
  value: string;
  description?: string;
}

interface DropdownFilterProps {
  label: string;
  options: FilterOption[];
  currentValue: string;
  paramKey: string;
  defaultLabel?: string;
  icon?: React.ReactNode;
  multiSelect?: boolean;
}

export function DropdownFilter({
  label,
  options,
  currentValue,
  paramKey,
  defaultLabel = "Все",
  icon,
  multiSelect = false,
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentValuesArray = currentValue ? currentValue.split(",") : [];

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (multiSelect) {
      if (!value) {
        // Clear all
        params.delete(paramKey);
        setIsOpen(false);
      } else {
        let newValues = [...currentValuesArray];
        if (newValues.includes(value)) {
          newValues = newValues.filter(v => v !== value);
        } else {
          newValues.push(value);
        }
        
        if (newValues.length > 0) {
          params.set(paramKey, newValues.join(","));
        } else {
          params.delete(paramKey);
        }
      }
    } else {
      if (value) {
        params.set(paramKey, value);
      } else {
        params.delete(paramKey);
      }
      setIsOpen(false);
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const displayLabel = multiSelect 
    ? (currentValuesArray.length > 0 ? `${currentValuesArray.length} выбрано` : defaultLabel)
    : (options.find((o) => o.value === currentValue)?.label || defaultLabel);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 text-sm font-medium ${
          isOpen || currentValue
            ? "bg-neon-cyan/10 border-neon-cyan text-neon-cyan"
            : "bg-dark-surface/50 border-dark-border text-dark-muted hover:border-neon-cyan/50 hover:text-dark-text"
        }`}
      >
        {icon && <span className="transition-transform">{icon}</span>}
        <span className="hidden sm:inline-block mr-1 opacity-70 flex-shrink-0">{label}:</span>
        <span className="font-semibold text-dark-text truncate max-w-[120px] sm:max-w-none">{displayLabel}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 mt-2 w-64 p-1.5 rounded-2xl glass-strong border border-dark-border shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-[400px] overflow-y-auto scrollbar-thin"
          >
            <button
              onClick={() => handleSelect("")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                !currentValue
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : "text-dark-muted hover:text-dark-text hover:bg-dark-hover"
              }`}
            >
              {defaultLabel}
              {!currentValue && <Check className="w-4 h-4" />}
            </button>
            
            <div className="mt-1 space-y-0.5">
              {options.map((option) => {
                const isActive = multiSelect 
                  ? currentValuesArray.includes(option.value)
                  : currentValue === option.value;
                  
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group ${
                      isActive
                        ? "bg-neon-cyan/20 text-neon-cyan"
                        : "text-dark-muted hover:text-dark-text hover:bg-dark-hover"
                    }`}
                  >
                    <div className="flex flex-col flex-1 pr-2">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-[10px] font-normal opacity-70 mt-0.5 line-clamp-2 leading-tight">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isActive ? (
                      <Check className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                    ) : multiSelect ? (
                      <div className="w-4 h-4 border border-dark-border rounded bg-dark-bg group-hover:border-neon-cyan/50 flex-shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
