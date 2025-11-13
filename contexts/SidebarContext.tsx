
import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(prevState => !prevState);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(prevState => !prevState);
  }

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  }

  const value = useMemo(() => ({ 
    isCollapsed, 
    toggleSidebar,
    isMobileOpen,
    toggleMobileSidebar,
    closeMobileSidebar
  }), [isCollapsed, isMobileOpen]);

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};