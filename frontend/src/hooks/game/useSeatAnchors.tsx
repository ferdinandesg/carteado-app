"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

/**
 * Âncoras da mesa usadas pelas animações para medir de onde/para onde
 * uma carta voa (assento de um jogador, centro, pilhas de vaza).
 */
export type AnchorId =
  | `seat:${string}`
  | "center"
  | "pile:ours"
  | "pile:opponent"
  | "deck";

export type AnchorOffset = { x: number; y: number };

type SeatAnchorsApi = {
  /** `false` quando não há provider acima (API vira no-op). */
  isProvided: boolean;
  register: (id: AnchorId, element: HTMLElement | null) => void;
  getRect: (id: AnchorId) => DOMRect | null;
  /** Delta entre os centros de duas âncoras (`to - from`), em px. */
  getOffset: (from: AnchorId, to: AnchorId) => AnchorOffset | null;
};

const noopApi: SeatAnchorsApi = {
  isProvided: false,
  register: () => {},
  getRect: () => null,
  getOffset: () => null,
};

const SeatAnchorsContext = createContext<SeatAnchorsApi>(noopApi);

export function SeatAnchorProvider({ children }: { children: ReactNode }) {
  const anchors = useRef(new Map<AnchorId, HTMLElement>());

  const api = useMemo<SeatAnchorsApi>(() => {
    const getRect = (id: AnchorId) =>
      anchors.current.get(id)?.getBoundingClientRect() ?? null;

    return {
      isProvided: true,
      register: (id, element) => {
        if (element) anchors.current.set(id, element);
        else anchors.current.delete(id);
      },
      getRect,
      getOffset: (from, to) => {
        const a = getRect(from);
        const b = getRect(to);
        if (!a || !b) return null;
        return {
          x: b.left + b.width / 2 - (a.left + a.width / 2),
          y: b.top + b.height / 2 - (a.top + a.height / 2),
        };
      },
    };
  }, []);

  return (
    <SeatAnchorsContext.Provider value={api}>
      {children}
    </SeatAnchorsContext.Provider>
  );
}

export function useSeatAnchors(): SeatAnchorsApi {
  return useContext(SeatAnchorsContext);
}

/** Callback ref que registra o elemento como âncora `id`. */
export function useAnchorRef(id: AnchorId) {
  const { register } = useSeatAnchors();
  return useCallback(
    (element: HTMLElement | null) => register(id, element),
    [register, id]
  );
}

export const seatAnchor = (userId: string): AnchorId => `seat:${userId}`;
