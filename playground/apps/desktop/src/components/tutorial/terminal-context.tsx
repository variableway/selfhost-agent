"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

interface TerminalContextType {
  pendingCommand: string | null;
  sendCommand: (command: string) => void;
}

const TerminalContext = createContext<TerminalContextType>({
  pendingCommand: null,
  sendCommand: () => {},
});

export function useTerminal() {
  return useContext(TerminalContext);
}

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const counterRef = useRef(0);

  const sendCommand = useCallback((command: string) => {
    counterRef.current += 1;
    setPendingCommand(`${command}__${counterRef.current}`);
  }, []);

  return (
    <TerminalContext.Provider value={{ pendingCommand, sendCommand }}>
      {children}
    </TerminalContext.Provider>
  );
}
