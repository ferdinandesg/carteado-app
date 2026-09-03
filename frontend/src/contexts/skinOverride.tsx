"use client";

import { createContext, useContext, type ReactNode } from "react";

const SkinOverrideContext = createContext<string | undefined>(undefined);

export function SkinOverrideProvider({
  skin,
  children,
}: {
  skin: string;
  children: ReactNode;
}) {
  return (
    <SkinOverrideContext.Provider value={skin}>
      {children}
    </SkinOverrideContext.Provider>
  );
}

export function useSkinOverride() {
  return useContext(SkinOverrideContext);
}
