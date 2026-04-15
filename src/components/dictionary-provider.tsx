"use client";

import React, { createContext, useContext } from "react";
import type { Dictionary } from "@/lib/i18n";

const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({
  children,
  dict,
}: {
  children: React.ReactNode;
  dict: Dictionary;
}) {
  return (
    <DictionaryContext.Provider value={dict}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return context;
}
