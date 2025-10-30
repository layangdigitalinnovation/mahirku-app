/* eslint-disable react-refresh/only-export-components */
// context/ActiveSectionContext.tsx
import { SectionName } from "@/types";
import React, { createContext, useContext, useState } from "react";

type ActiveSectionContextType = {
  active: SectionName;
  setActive: (section: SectionName) => void;
};

const ActiveSectionContext = createContext<ActiveSectionContextType | undefined>(undefined);

export const ActiveSectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [active, setActive] = useState<SectionName>("beranda");
  return (
    <ActiveSectionContext.Provider value={{ active, setActive }}>
      {children}
    </ActiveSectionContext.Provider>
  );
};

export const useActiveSection = () => {
  const ctx = useContext(ActiveSectionContext);
  if (!ctx) throw new Error("useActiveSection must be used inside ActiveSectionProvider");
  return ctx;
};
