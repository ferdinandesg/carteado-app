import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();

    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, [query]);

  return matches;
}

/** Dispositivos de toque (sem hover confiável). */
export function useCoarsePointer(): boolean {
  return useMediaQuery("(pointer: coarse)");
}
