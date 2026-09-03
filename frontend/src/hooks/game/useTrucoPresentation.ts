import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { Card } from "shared/cards";
import { GameStatus, ITrucoGameState, PowerId } from "shared/game";

import { useGameStore } from "@/contexts/game.store";
import { getCardKey } from "@/lib/cards/cardKey";
import {
  getTrickPilesByTeam,
  type TrickPiles,
} from "@/lib/game/trucoHandResults";
import { type TrucoTableEvent } from "@/lib/game/trucoTableEvents";

import { useTrucoTableEvents } from "./useTrucoTableEvents";

export type PlayedEntry = {
  card: Card;
  key: string;
  /** Quem jogou (null quando não identificável). */
  playerId: string | null;
  /** Coveiro: a substituta entra vindo do baralho. */
  fromDeck?: boolean;
  /** Ilusionista: face falsa a virar para `card` em `TIMINGS.illusionReveal`. */
  revealFrom?: Card;
};

export type DepartTarget = "ours" | "opponent" | "tie";

export type DepartingTrick = {
  id: number;
  cards: PlayedEntry[];
  target: DepartTarget;
};

export type TrucoEffect =
  | { id: number; kind: "trucoAsked"; bet: number; askerId: string }
  | { id: number; kind: "trucoAccepted"; bet: number }
  | { id: number; kind: "trucoRejected"; won: boolean; points: number }
  | { id: number; kind: "roundFinished"; won: boolean; points: number }
  | { id: number; kind: "matchFinished"; won: boolean }
  | { id: number; kind: "powerUsed"; powerId: string; userId: string };

type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

export type TrucoEffectInput = DistributiveOmit<TrucoEffect, "id">;

export const TIMINGS = {
  /** Tempo para o jogador ver a última carta antes da vaza sair. */
  settleAfterPlay: 600,
  /** Duração do voo da vaza até a pilha. */
  depart: 650,
  /** Pausa antes de limpar as pilhas ao trocar de rodada. */
  roundClear: 1000,
  effect: 1000,
  /** Coveiro: carta jogada fica visível antes de voltar ao baralho. */
  graveHold: 450,
  /** Raio-X: tempo que a carta espiada fica visível ao lado do alvo. */
  xrayPeek: 1600,
  /** Sexto Sentido: tempo do selo sim/não ao lado do alvo. */
  radarPeek: 1600,
  /** Ilusionista: virada da manilha falsa para a carta real. */
  illusionReveal: 500,
} as const;

export type GraveHold = {
  id: number;
  playerId: string;
  outgoing: Card;
  incoming: Card;
};

export type XrayPeek = {
  id: number;
  targetUserId: string;
  card: Card;
};

export type RadarPeek = {
  id: number;
  targetUserId: string;
  hasManilha: boolean;
};

type State = {
  gameId: string | null;
  /**
   * Vaza recém-fechada mantida no centro (o servidor já limpou `bunch`,
   * mas a última carta precisa aparecer antes de voar).
   */
  hold: {
    id: number;
    cards: Card[];
    target: DepartTarget;
    revealFrom?: (Card | undefined)[];
  } | null;
  departing: DepartingTrick | null;
  /** Quantos `handsResults` já estão nas pilhas 3/9. */
  settledResults: number;
  displayRound: number;
  effect: TrucoEffect | null;
  graveHold: GraveHold | null;
  xrayPeek: XrayPeek | null;
  radarPeek: RadarPeek | null;
};

type Action =
  | { type: "init"; game: ITrucoGameState }
  | {
      type: "hold";
      id: number;
      cards: Card[];
      target: DepartTarget;
      revealFrom?: (Card | undefined)[];
    }
  | { type: "depart"; id: number; cards: PlayedEntry[] }
  | { type: "settle"; id: number }
  | { type: "newRound"; round: number }
  | { type: "effect"; effect: TrucoEffect }
  | { type: "clearEffect"; id: number }
  | { type: "graveHold"; hold: GraveHold }
  | { type: "clearGraveHold"; id: number }
  | { type: "xrayPeek"; peek: XrayPeek }
  | { type: "clearXrayPeek"; id: number }
  | { type: "radarPeek"; peek: RadarPeek }
  | { type: "clearRadarPeek"; id: number };

const initialState: State = {
  gameId: null,
  hold: null,
  departing: null,
  settledResults: 0,
  displayRound: 0,
  effect: null,
  graveHold: null,
  xrayPeek: null,
  radarPeek: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "init":
      return {
        ...initialState,
        gameId: action.game.id,
        settledResults: action.game.handsResults.length,
        displayRound: action.game.rounds,
      };
    case "hold":
      return {
        ...state,
        hold: {
          id: action.id,
          cards: action.cards,
          target: action.target,
          revealFrom: action.revealFrom,
        },
      };
    case "depart":
      if (!state.hold || state.hold.id !== action.id) return state;
      return {
        ...state,
        hold: null,
        departing: {
          id: action.id,
          cards: action.cards,
          target: state.hold.target,
        },
      };
    case "settle":
      return {
        ...state,
        departing: state.departing?.id === action.id ? null : state.departing,
        settledResults: state.settledResults + 1,
      };
    case "newRound":
      return { ...state, displayRound: action.round };
    case "effect":
      return { ...state, effect: action.effect };
    case "clearEffect":
      return state.effect?.id === action.id
        ? { ...state, effect: null }
        : state;
    case "graveHold":
      return { ...state, graveHold: action.hold };
    case "clearGraveHold":
      return state.graveHold?.id === action.id
        ? { ...state, graveHold: null }
        : state;
    case "xrayPeek":
      return { ...state, xrayPeek: action.peek };
    case "clearXrayPeek":
      return state.xrayPeek?.id === action.id
        ? { ...state, xrayPeek: null }
        : state;
    case "radarPeek":
      return { ...state, radarPeek: action.peek };
    case "clearRadarPeek":
      return state.radarPeek?.id === action.id
        ? { ...state, radarPeek: null }
        : state;
    default:
      return state;
  }
}

let sequence = 0;
const nextId = () => ++sequence;

export const sameCard = (a: Card, b: Card) =>
  a.rank === b.rank && a.suit === b.suit;

/**
 * `illusionReal` é dado privado de quem jogou — igual ao `power_result`.
 * Parceiro e adversário veem só o Zap falso, sem brilho.
 */
export function cardForIllusionViewer(
  card: Card,
  ownerId: string | null,
  viewerId: string | null
): Card {
  if (!card.illusionReal || ownerId === viewerId) return card;
  const { illusionReal: _hidden, ...rest } = card;
  return rest;
}

function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
}

/** Dono de uma carta na mesa: quem a tem em `playedCards` nesta rodada. */
export function resolveCardOwner(
  game: ITrucoGameState,
  card: Card
): string | null {
  return (
    game.players.find((player) =>
      player.playedCards.some((played) => sameCard(played, card))
    )?.userId ?? null
  );
}

/**
 * O Coveiro troca com o baralho, não com o leque: a mão visual é só a mão real.
 */
export function visualHandForGrave(
  hand: Card[],
  _hold: GraveHold | null,
  _localUserId: string | null
): Card[] {
  return [...hand].sort((a, b) => a.value - b.value);
}

function markGraveDeckOrigin(
  entries: PlayedEntry[],
  game: ITrucoGameState,
  hold: GraveHold | null
): PlayedEntry[] {
  if (hold) return entries;
  const usage = [...(game.powerUsages ?? [])]
    .reverse()
    .find(
      (item) =>
        item.powerId === PowerId.GRAVEDIGGER && Boolean(item.replacementCard)
    );
  if (!usage?.replacementCard) return entries;
  return entries.map((entry) =>
    sameCard(entry.card, usage.replacementCard!)
      ? { ...entry, fromDeck: true }
      : entry
  );
}

/** Mostra a carta jogada no lugar da substituta enquanto o hold estiver ativo. */
export function applyGraveHoldToBunch(
  entries: PlayedEntry[],
  hold: GraveHold | null
): PlayedEntry[] {
  if (!hold) return entries;
  const idx = findLastIndex(entries, (entry) =>
    sameCard(entry.card, hold.incoming)
  );
  if (idx === -1) return entries;
  const next = [...entries];
  next[idx] = {
    card: hold.outgoing,
    key: getCardKey(hold.outgoing),
    playerId: hold.playerId,
  };
  return next;
}

export type TrucoPresentation = {
  /** Cartas visíveis no centro (vaza atual ou vaza fechada aguardando voo). */
  bunch: PlayedEntry[];
  departing: DepartingTrick | null;
  piles: TrickPiles;
  effect: TrucoEffect | null;
  myTeamId: string | null;
  /** Jogadores que devem responder ao truco pendente. */
  respondingPlayerIds: string[];
  /** Mão local; o Coveiro não mexe no leque (a troca é com o baralho). */
  visualHand: Card[];
  graveHold: GraveHold | null;
  xrayPeek: XrayPeek | null;
  radarPeek: RadarPeek | null;
};

/**
 * Camada de apresentação do Truco: transforma snapshots em um estado visual
 * sequenciado (carta entra → vaza voa → pilhas atualizam → rodada limpa).
 */
export function useTrucoPresentation(
  game: ITrucoGameState | null
): TrucoPresentation {
  const userId = useGameStore((state) => state.userId);
  const powerPeek = useGameStore((state) => state.powerPeek);
  const setPowerPeek = useGameStore((state) => state.setPowerPeek);
  const reduceMotion = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, initialState);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = useCallback((delay: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, delay));
  }, []);

  useEffect(() => {
    const active = timers.current;
    return () => active.forEach(clearTimeout);
  }, []);

  const myTeamId = useMemo(
    () =>
      game?.teams.find((team) => team.userIds.includes(userId ?? "-"))?.id ??
      null,
    [game?.teams, userId]
  );

  useEffect(() => {
    if (game && game.id !== state.gameId) dispatch({ type: "init", game });
  }, [game, state.gameId]);

  const pushEffect = useCallback(
    (delay: number, effect: TrucoEffectInput) => {
      const id = nextId();
      const full = { ...effect, id } as TrucoEffect;
      schedule(delay, () => dispatch({ type: "effect", effect: full }));
      schedule(delay + TIMINGS.effect, () =>
        dispatch({ type: "clearEffect", id })
      );
    },
    [schedule]
  );

  useEffect(() => {
    if (!powerPeek) return;
    const id = nextId();

    if (powerPeek.powerId === PowerId.X_RAY) {
      dispatch({
        type: "xrayPeek",
        peek: {
          id,
          targetUserId: powerPeek.targetUserId,
          card: powerPeek.card,
        },
      });
      schedule(TIMINGS.xrayPeek, () => dispatch({ type: "clearXrayPeek", id }));
    } else if (powerPeek.powerId === PowerId.SIXTH_SENSE) {
      dispatch({
        type: "radarPeek",
        peek: {
          id,
          targetUserId: powerPeek.targetUserId,
          hasManilha: powerPeek.hasManilha,
        },
      });
      schedule(TIMINGS.radarPeek, () =>
        dispatch({ type: "clearRadarPeek", id })
      );
    }

    setPowerPeek(null);
  }, [powerPeek, schedule, setPowerPeek]);

  const handleEvents = useCallback(
    (events: TrucoTableEvent[], next: ITrucoGameState) => {
      let delay = 0;

      for (const event of events) {
        switch (event.type) {
          case "cardPlayed":
            // O centro deriva de `game.bunch`; nada a fazer aqui.
            break;

          case "trickFinished": {
            const { result, disguisedBunch } = event;
            const target: DepartTarget = result.isTie
              ? "tie"
              : result.winnerTeamId === myTeamId
                ? "ours"
                : "opponent";
            const id = nextId();
            const revealFrom = disguisedBunch?.map((card, index) => {
              if (!card.illusionReal) return undefined;
              const owner = resolveCardOwner(next, result.bunch[index] ?? card);
              return owner === userId ? card : undefined;
            });
            const hasReveal = Boolean(
              revealFrom?.some((card) => Boolean(card)) && !reduceMotion
            );
            const cards = result.bunch.map((card) => ({
              card,
              key: getCardKey(card),
              playerId: resolveCardOwner(next, card),
            }));
            const holdMs = hasReveal
              ? Math.max(TIMINGS.illusionReveal, TIMINGS.settleAfterPlay)
              : TIMINGS.settleAfterPlay;

            dispatch({
              type: "hold",
              id,
              cards: result.bunch,
              target,
              revealFrom: hasReveal ? revealFrom : undefined,
            });
            schedule(delay + holdMs, () =>
              dispatch({ type: "depart", id, cards })
            );
            delay += holdMs + TIMINGS.depart;
            schedule(delay, () => dispatch({ type: "settle", id }));
            break;
          }

          case "trucoAsked":
            pushEffect(0, {
              kind: "trucoAsked",
              bet: event.bet,
              askerId: event.askerId,
            });
            break;

          case "trucoAccepted":
            pushEffect(0, { kind: "trucoAccepted", bet: event.bet });
            break;

          case "trucoRejected":
            pushEffect(0, {
              kind: "trucoRejected",
              won: event.winnerTeamId === myTeamId,
              points: event.points,
            });
            delay += TIMINGS.effect;
            break;

          case "powerUsed":
            if (
              event.powerId === PowerId.ILLUSIONIST &&
              event.userId !== userId
            ) {
              break;
            }
            pushEffect(0, {
              kind: "powerUsed",
              powerId: event.powerId,
              userId: event.userId,
            });
            if (
              !reduceMotion &&
              event.powerId === PowerId.GRAVEDIGGER &&
              event.returnedCard &&
              event.replacementCard &&
              !sameCard(event.returnedCard, event.replacementCard)
            ) {
              const id = nextId();
              dispatch({
                type: "graveHold",
                hold: {
                  id,
                  playerId: event.userId,
                  outgoing: event.returnedCard,
                  incoming: event.replacementCard,
                },
              });
              schedule(TIMINGS.graveHold, () =>
                dispatch({ type: "clearGraveHold", id })
              );
            }
            break;

          case "roundFinished":
            if (event.winnerTeamId) {
              pushEffect(delay, {
                kind: "roundFinished",
                won: event.winnerTeamId === myTeamId,
                points: event.points,
              });
            }
            if (next.status !== GameStatus.FINISHED) {
              schedule(delay + TIMINGS.roundClear, () =>
                dispatch({ type: "newRound", round: next.rounds })
              );
            }
            break;

          case "matchFinished":
            pushEffect(delay + TIMINGS.roundClear, {
              kind: "matchFinished",
              won: event.winnerTeamId === myTeamId,
            });
            break;
        }
      }
    },
    [myTeamId, pushEffect, reduceMotion, schedule, userId]
  );

  useTrucoTableEvents(game, handleEvents);

  const bunch = useMemo<PlayedEntry[]>(() => {
    if (!game) return [];
    const cards = state.hold?.cards ?? game.bunch;
    const entries = cards.map((card, index) => {
      const playerId = resolveCardOwner(game, card);
      return {
        card: cardForIllusionViewer(card, playerId, userId),
        key: getCardKey(card),
        playerId,
        revealFrom: state.hold?.revealFrom?.[index],
      };
    });
    return markGraveDeckOrigin(
      applyGraveHoldToBunch(entries, state.graveHold),
      game,
      state.graveHold
    );
  }, [game, state.hold, state.graveHold, userId]);

  const visualHand = useMemo(() => {
    const hand =
      game?.players.find((player) => player.userId === userId)?.hand ?? [];
    return visualHandForGrave(hand, state.graveHold, userId);
  }, [game, userId, state.graveHold]);

  const piles = useMemo(
    () =>
      getTrickPilesByTeam(
        game?.handsResults.slice(0, state.settledResults) ?? [],
        state.displayRound,
        myTeamId
      ),
    [game?.handsResults, state.settledResults, state.displayRound, myTeamId]
  );

  const respondingPlayerIds = useMemo(() => {
    if (!game || game.trucoState !== "PENDING" || !game.trucoAskerId) return [];
    const askerTeam = game.teams.find((t) =>
      t.userIds.includes(game.trucoAskerId ?? "-")
    );
    return game.teams
      .filter((t) => t.id !== askerTeam?.id)
      .flatMap((t) => t.userIds);
  }, [game]);

  return {
    bunch,
    departing: state.departing,
    piles,
    effect: state.effect,
    myTeamId,
    respondingPlayerIds,
    visualHand,
    graveHold: state.graveHold,
    xrayPeek: state.xrayPeek,
    radarPeek: state.radarPeek,
  };
}
