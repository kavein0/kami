"use client";

import React, { createContext, useContext } from "react";

const DictionaryContext = createContext<any>(null);

export function DictionaryProvider({
  children,
  dict,
}: {
  children: React.ReactNode;
  dict: any;
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
