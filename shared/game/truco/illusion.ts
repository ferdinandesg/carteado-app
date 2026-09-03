import { Card, RANK_TO_VALUE, type Rank, type Suit } from "../../cards";
import type { ITrucoGameState } from "../game.types";
import { areTeammates } from "./teams";

/** Zap = manilha de paus, a carta mais alta do jogo. */
export const ILLUSION_SUIT: Suit = "clubs";

/** Ilusionista: a carta passa a exibir o Zap; a identidade real fica em `illusionReal`. Muta `card`. */
export function disguiseAsZap(card: Card, manilha: string): void {
  if (card.illusionReal || !manilha) return;
  const rank = manilha as Rank;
  const value = RANK_TO_VALUE[rank];
  card.illusionReal = {
    rank: card.rank,
    suit: card.suit,
    toString: card.toString,
  };
  card.rank = rank;
  card.suit = ILLUSION_SUIT;
  card.toString = `${rank} of ${ILLUSION_SUIT}`;
  card.value = Array.isArray(value) ? value[0] : value;
  card.secondaryValue = Array.isArray(value) ? value[1] : null;
}

/** Desfaz o disfarce (revelação no fim da vaza). Muta `card`. */
export function restoreIllusion(card: Card): void {
  const real = card.illusionReal;
  if (!real) return;
  card.rank = real.rank;
  card.suit = real.suit;
  card.toString = real.toString;
  delete card.illusionReal;
}

/** Restaura todas as cartas disfarçadas na mesa e nas jogadas dos jogadores. */
export function restoreIllusions(game: {
  bunch: Card[];
  players: { playedCards: Card[] }[];
}): void {
  game.bunch.forEach(restoreIllusion);
  game.players.forEach((player) => player.playedCards.forEach(restoreIllusion));
}

/** Cópia da carta sem o segredo (o que adversários devem ver). */
export function withoutIllusion(card: Card): Card {
  if (!card.illusionReal) return card;
  const { illusionReal: _hidden, ...rest } = card;
  return rest;
}

/**
 * Projeção do estado para um espectador: só o time de quem jogou vê
 * `illusionReal`. Não muta `state`; retorna o mesmo objeto se nada mudar.
 */
export function maskIllusionsForViewer(
  state: ITrucoGameState,
  viewerId: string
): ITrucoGameState {
  const hasSecret =
    state.bunch.some((card) => card.illusionReal) ||
    state.players.some((player) =>
      player.playedCards.some((card) => card.illusionReal)
    );
  if (!hasSecret) return state;

  const ownerOf = (card: Card) =>
    state.players.find((player) =>
      player.playedCards.some(
        (played) => played.rank === card.rank && played.suit === card.suit
      )
    )?.userId;

  const project = (card: Card, ownerId: string | undefined) =>
    ownerId && areTeammates(state.teams, ownerId, viewerId)
      ? card
      : withoutIllusion(card);

  return {
    ...state,
    bunch: state.bunch.map((card) => project(card, ownerOf(card))),
    players: state.players.map((player) => ({
      ...player,
      playedCards: player.playedCards.map((card) =>
        project(card, player.userId)
      ),
    })),
  };
}
