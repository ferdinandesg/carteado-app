import Deck, { Card, Rank, Suit, RANK_TO_VALUE } from "shared/cards";
import { BasePlayer, PlayerStatus } from "shared/game";

/**
 * Cria uma carta real (mesmo shape do Deck), com value/secondaryValue
 * derivados de RANK_TO_VALUE — igual ao baralho de produção.
 */
export function card(rank: Rank, suit: Suit, isHidden = false): Card {
  const value = RANK_TO_VALUE[rank];
  return {
    rank,
    suit,
    value: Array.isArray(value) ? value[0] : value,
    secondaryValue: Array.isArray(value) ? value[1] : null,
    toString: `${rank} of ${suit}`,
    isHidden,
  };
}

export function makePlayer(
  userId: string,
  overrides: Partial<BasePlayer> = {}
): BasePlayer {
  return {
    userId,
    name: userId,
    status: PlayerStatus.WAITING,
    hand: [],
    table: [],
    playedCards: [],
    teamId: "",
    ...overrides,
  };
}

export function makePlayers(ids: string[]): BasePlayer[] {
  return ids.map((id) => makePlayer(id));
}

/**
 * Substitui as cartas do deck para que `draw()` devolva exatamente
 * `drawOrder` na ordem informada (draw() faz pop do fim do array).
 */
export function rigDeck(deck: Deck, drawOrder: Card[]): void {
  deck.cards = drawOrder
    .slice()
    .reverse()
    .map((c) => ({ ...c }));
}

/** PRNG determinístico (mulberry32) para substituir Math.random em testes. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Instala um Math.random determinístico. Lembre de chamar
 * `spy.mockRestore()` (ou usar jest.restoreAllMocks) ao final do teste.
 */
export function installSeededRandom(seed = 42): jest.SpyInstance<number, []> {
  return jest.spyOn(Math, "random").mockImplementation(seededRandom(seed));
}

/**
 * Normaliza quais cartas da mão do jogador ficam ocultas, comparando por
 * `toString`. Útil após dealInitialHands do carteado, que sorteia as ocultas.
 */
export function forceHidden(player: BasePlayer, hidden: Card[]): void {
  const hiddenKeys = new Set(hidden.map((c) => c.toString));
  for (const c of player.hand) {
    c.isHidden = hiddenKeys.has(c.toString);
  }
  for (const c of player.table) {
    c.isHidden = hiddenKeys.has(c.toString);
  }
}
