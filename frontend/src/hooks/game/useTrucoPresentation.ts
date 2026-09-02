import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { Card } from "shared/cards";
import { ITrucoGameState } from "shared/game";

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
  | { id: number; kind: "matchFinished"; won: boolean };

type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

export type TrucoEffectInput = DistributiveOmit<TrucoEffect, "id">;

export const TIMINGS = {
  /** Tempo para o jogador ver a última carta antes da vaza sair. */
  settleAfterPlay: 900,
  /** Duração do voo da vaza até a pilha. */
  depart: 650,
  /** Pausa antes de limpar as pilhas ao trocar de rodada. */
  roundClear: 1400,
  effect: 1600,
} as const;

type State = {
  gameId: string | null;
  /**
   * Vaza recém-fechada mantida no centro (o servidor já limpou `bunch`,
   * mas a última carta precisa aparecer antes de voar).
   */
  hold: { id: number; cards: Card[]; target: DepartTarget } | null;
  departing: DepartingTrick | null;
  /** Quantos `handsResults` já estão nas pilhas 3/9. */
  settledResults: number;
  displayRound: number;
  effect: TrucoEffect | null;
};

type Action =
  | { type: "init"; game: ITrucoGameState }
  | { type: "hold"; id: number; cards: Card[]; target: DepartTarget }
  | { type: "depart"; id: number; cards: PlayedEntry[] }
  | { type: "settle"; id: number }
  | { type: "newRound"; round: number }
  | { type: "effect"; effect: TrucoEffect }
  | { type: "clearEffect"; id: number };

const initialState: State = {
  gameId: null,
  hold: null,
  departing: null,
  settledResults: 0,
  displayRound: 0,
  effect: null,
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
        hold: { id: action.id, cards: action.cards, target: action.target },
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
    default:
      return state;
  }
}

let sequence = 0;
const nextId = () => ++sequence;

const sameCard = (a: Card, b: Card) => a.rank === b.rank && a.suit === b.suit;

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

export type TrucoPresentation = {
  /** Cartas visíveis no centro (vaza atual ou vaza fechada aguardando voo). */
  bunch: PlayedEntry[];
  departing: DepartingTrick | null;
  piles: TrickPiles;
  effect: TrucoEffect | null;
  myTeamId: string | null;
  /** Jogadores que devem responder ao truco pendente. */
  respondingPlayerIds: string[];
};

/**
 * Camada de apresentação do Truco: transforma snapshots em um estado visual
 * sequenciado (carta entra → vaza voa → pilhas atualizam → rodada limpa).
 */
export function useTrucoPresentation(
  game: ITrucoGameState | null
): TrucoPresentation {
  const userId = useGameStore((state) => state.userId);
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

  const handleEvents = useCallback(
    (events: TrucoTableEvent[], next: ITrucoGameState) => {
      let delay = 0;

      for (const event of events) {
        switch (event.type) {
          case "cardPlayed":
            // O centro deriva de `game.bunch`; nada a fazer aqui.
            break;

          case "trickFinished": {
            const { result } = event;
            const target: DepartTarget = result.isTie
              ? "tie"
              : result.winnerTeamId === myTeamId
                ? "ours"
                : "opponent";
            const id = nextId();
            const cards = result.bunch.map((card) => ({
              card,
              key: getCardKey(card),
              playerId: resolveCardOwner(next, card),
            }));

            dispatch({ type: "hold", id, cards: result.bunch, target });
            schedule(delay + TIMINGS.settleAfterPlay, () =>
              dispatch({ type: "depart", id, cards })
            );
            delay += TIMINGS.settleAfterPlay + TIMINGS.depart;
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

          case "roundFinished":
            if (event.winnerTeamId) {
              pushEffect(delay, {
                kind: "roundFinished",
                won: event.winnerTeamId === myTeamId,
                points: event.points,
              });
            }
            schedule(delay + TIMINGS.roundClear, () =>
              dispatch({ type: "newRound", round: next.rounds })
            );
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
    [myTeamId, pushEffect, schedule]
  );

  useTrucoTableEvents(game, handleEvents);

  const bunch = useMemo<PlayedEntry[]>(() => {
    if (!game) return [];
    const cards = state.hold?.cards ?? game.bunch;
    return cards.map((card) => ({
      card,
      key: getCardKey(card),
      playerId: resolveCardOwner(game, card),
    }));
  }, [game, state.hold]);

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
  };
}
