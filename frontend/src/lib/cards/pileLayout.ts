export type PileVariant = "spread" | "stack";

export type PileTransform = {
  /** Deslocamento horizontal em % da largura da própria carta. */
  x: number;
  /** Deslocamento vertical em % da altura da própria carta. */
  y: number;
  /** Rotação em graus. */
  rotate: number;
};

/** Ruído determinístico em [-1, 1] a partir do índice (sem Math.random). */
export function pileNoise(index: number, salt = 0): number {
  const n = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

/**
 * Posição de cada carta numa pilha.
 * - `spread`: cartas da vaza lado a lado no centro, levemente tortas.
 * - `stack`: monte compacto (vazas ganhas, baralho), só ruído leve.
 */
export function getPileTransform(
  index: number,
  count: number,
  variant: PileVariant
): PileTransform {
  if (variant === "spread") {
    const k = index - (count - 1) / 2;
    return {
      x: k * 55 + pileNoise(index, 1) * 4,
      y: pileNoise(index, 2) * 4,
      rotate: pileNoise(index, 3) * 8,
    };
  }

  return {
    x: pileNoise(index, 4) * 3,
    y: pileNoise(index, 5) * 2 - index * 0.6,
    rotate: pileNoise(index, 6) * 5,
  };
}
