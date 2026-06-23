"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DirtyStateContextType {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

const DirtyStateContext = createContext<DirtyStateContextType | undefined>(undefined);

export function DirtyStateProvider({ children }: { children: React.ReactNode }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Prevent closing the tab if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <DirtyStateContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges }}>
      {children}
    </DirtyStateContext.Provider>
  );
}

export function useDirtyState() {
  const context = useContext(DirtyStateContext);
  if (context === undefined) {
    throw new Error("useDirtyState must be used within a DirtyStateProvider");
  }
  return context;
}
