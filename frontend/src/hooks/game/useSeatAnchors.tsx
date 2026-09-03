"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
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

/**
 * Offset do centro da mesa até o assento. `null` até medir (evita o overlay
 * nascer no centro e depois pular para a esquerda/direita).
 */
export function useCenterOffsetToSeat(
  userId: string | undefined | null
): AnchorOffset | null {
  const { getOffset } = useSeatAnchors();
  const [measured, setMeasured] = useState<{
    userId: string;
    offset: AnchorOffset;
  } | null>(null);

  // Mede antes do paint: os assentos já estão no DOM quando o overlay monta.
  useLayoutEffect(() => {
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeasured({
      userId,
      offset: getOffset("center", seatAnchor(userId)) ?? { x: 0, y: 0 },
    });
  }, [getOffset, userId]);

  if (!userId || measured?.userId !== userId) return null;
  return measured.offset;
}
