
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AlertContextType = {
  showAlert: (title: string, description: string) => void;
  isAlertOpen: boolean;
  alertContent: { title: string; description: string };
  closeAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', description: '' });

  const showAlert = useCallback((title: string, description: string) => {
    setAlertContent({ title, description });
    setIsAlertOpen(true);
  }, []);

  const closeAlert = useCallback(() => {
    setIsAlertOpen(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, isAlertOpen, alertContent, closeAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
