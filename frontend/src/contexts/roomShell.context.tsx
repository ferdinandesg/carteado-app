"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export type RoomPanel = "chat" | "info";

type RoomShellContextValue = {
  /** Abaixo de `$breakpoint-md`: painéis laterais viram bottom sheet. */
  isMobile: boolean;
  activePanel: RoomPanel | null;
  openPanel: (panel: RoomPanel) => void;
  closePanel: () => void;
  chatUnread: number;
  setChatUnread: (count: number) => void;
};

const RoomShellContext = createContext<RoomShellContextValue | null>(null);

export const ROOM_MOBILE_QUERY = "(max-width: 768px)";

export function RoomShellProvider({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery(ROOM_MOBILE_QUERY);
  const [activePanel, setActivePanel] = useState<RoomPanel | null>(null);
  const [chatUnread, setChatUnread] = useState(0);

  const openPanel = useCallback((panel: RoomPanel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  }, []);
  const closePanel = useCallback(() => setActivePanel(null), []);

  const value = useMemo(
    () => ({
      isMobile,
      activePanel,
      openPanel,
      closePanel,
      chatUnread,
      setChatUnread,
    }),
    [isMobile, activePanel, openPanel, closePanel, chatUnread]
  );

  return (
    <RoomShellContext.Provider value={value}>
      {children}
    </RoomShellContext.Provider>
  );
}

/** Opcional: componentes como o Chat funcionam também fora do RoomShell. */
export function useRoomShell(): RoomShellContextValue | null {
  return useContext(RoomShellContext);
}
