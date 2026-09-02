/** Standard poker card proportion (2.5" × 3.5"). */
export const CARD_ASPECT_RATIO = 5 / 7;

export const CARD_SIZES = {
  xs: 70,
  sm: 98,
  md: 126,
  lg: 154,
  xl: 182,
} as const;

export type CardSize = keyof typeof CARD_SIZES;

/** Altura base assumida quando a carta está fora da mesa (sem `--card-h`). */
export const CARD_BASE_HEIGHT = CARD_SIZES.lg;

/**
 * Multiplicador aplicado sobre `--card-h` (altura fluida da mesa) para cada
 * token. Mantém a proporção dos presets fixos: `lg` é a referência (1x).
 */
export function getCardScale(size: CardSize = "md"): number {
  return Number((CARD_SIZES[size] / CARD_BASE_HEIGHT).toFixed(3));
}

export function resolveCardHeight(
  size: CardSize = "md",
  height?: number
): number {
  return height ?? CARD_SIZES[size];
}

export function getCardWidth(height: number): number {
  return Math.round(height * CARD_ASPECT_RATIO);
}

export function getCardDimensions(
  size: CardSize = "md",
  height?: number
): { height: number; width: number } {
  const resolvedHeight = resolveCardHeight(size, height);
  return {
    height: resolvedHeight,
    width: getCardWidth(resolvedHeight),
  };
}
