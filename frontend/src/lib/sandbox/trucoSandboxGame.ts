import Deck, {
  Card,
  getNextRank,
  isTrucoRank,
  RANK_TO_VALUE,
  sameCard,
  type Rank,
  type Suit,
} from "shared/cards";
import {
  applyMercenarySteal,
  BasePlayer,
  disguiseAsZap,
  findGravediggerCandidates,
  findTeamByUserId,
  GameStatus,
  GameType,
  getOpponentTeam,
  isPowerId,
  ITrucoGameState,
  nextTrucoBet,
  pickRandom,
  PlayerStatus,
  PowerId,
  resolveRoundOutcome,
  resolveTrickWinner,
  restoreIllusions,
  SILVER_SHIELD_REJECT_POINTS,
  stampPowersOnDeck,
  TRUCO_BOT_DELAY_MS,
  TRUCO_MAX_BET,
  TRUCO_WINNING_SCORE,
  trucoRejectPoints,
  type PowerPrivateResult,
  type PowerUsage,
} from "shared/game";
import type { Team } from "shared/types";

/**
 * Motor local do Truco para a sandbox (você × bot, sem servidor). As regras
 * vêm de `shared/game/truco`; aqui só existe a orquestração do estado.
 * Cada ação clona o snapshot e muta a cópia, devolvendo um objeto novo para
 * o store.
 */

export const SANDBOX_YOU_ID = "sandbox-you";
export const SANDBOX_BOT_ID = "sandbox-bot";
export const SANDBOX_BOT_DELAY_MS = TRUCO_BOT_DELAY_MS;

type SandboxNames = { you: string; bot: string };

export type SandboxPlayResult = {
  game: ITrucoGameState;
  privateResult?: PowerPrivateResult;
};

export function makeSandboxCard(
  rank: Rank,
  suit: Suit,
  powerId?: string
): Card {
  const value = RANK_TO_VALUE[rank];
  return {
    rank,
    suit,
    value: Array.isArray(value) ? value[0] : value,
    secondaryValue: Array.isArray(value) ? value[1] : null,
    toString: `${rank} of ${suit}`,
    powerId,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function makePlayer(userId: string, name: string, teamId: string): BasePlayer {
  return {
    userId,
    name,
    status: PlayerStatus.WAITING,
    hand: [],
    playedCards: [],
    table: [],
    teamId,
    isBot: userId === SANDBOX_BOT_ID,
  };
}

function drawTrucoCard(deck: Deck): Card {
  let card = deck.draw();
  while (card && !isTrucoRank(card.rank) && deck.getCards().length > 0) {
    card = deck.draw();
  }
  if (!card || !isTrucoRank(card.rank)) throw new Error("SANDBOX_DECK_EMPTY");
  return card;
}

function asStateDeck(cards: Card[]): ITrucoGameState["deck"] {
  return { cards, numberOfFullDecks: 1 } as unknown as ITrucoGameState["deck"];
}

function setTurn(game: ITrucoGameState, userId: string): void {
  game.playerTurn = userId;
  game.players.forEach((player) => {
    player.status =
      player.userId === userId ? PlayerStatus.PLAYING : PlayerStatus.WAITING;
  });
}

function getPlayer(game: ITrucoGameState, userId: string): BasePlayer {
  const player = game.players.find((item) => item.userId === userId);
  if (!player) throw new Error("SANDBOX_PLAYER_NOT_FOUND");
  return player;
}

function ownerOf(game: ITrucoGameState, card: Card): string {
  return (
    game.players.find((player) =>
      player.playedCards.some((played) => sameCard(played, card))
    )?.userId ?? game.playerTurn
  );
}

// ---------------------------------------------------------------------------
// Rodadas
// ---------------------------------------------------------------------------

/** Nova mão: baralho novo, 3 cartas por jogador, vira, manilha e carimbos. */
export function dealSandboxRound(
  game: ITrucoGameState,
  names?: SandboxNames
): ITrucoGameState {
  const next = clone(game);
  const deck = new Deck();

  next.rounds += 1;
  next.currentBet = 1;
  next.status = GameStatus.PLAYING;
  next.trucoState = "NONE";
  next.trucoAskerId = null;
  next.bunch = [];
  next.activeEffects = [];
  next.teams.forEach((team) => (team.roundWins = 0));

  next.players.forEach((player) => {
    if (names) {
      player.name = player.userId === SANDBOX_YOU_ID ? names.you : names.bot;
    }
    player.hand = Array.from({ length: 3 }, () => drawTrucoCard(deck));
    player.playedCards = [];
    player.table = [];
  });

  const vira = drawTrucoCard(deck);
  delete vira.powerId;
  next.vira = vira;
  next.manilha = getNextRank(vira.rank);
  stampPowersOnDeck(
    next.players.flatMap((player) => player.hand),
    undefined,
    { excludeRanks: [next.manilha] }
  );
  next.deck = asStateDeck(deck.getCards().filter((c) => isTrucoRank(c.rank)));

  setTurn(next, SANDBOX_YOU_ID);
  return next;
}

export function createSandboxTrucoGame(names: SandboxNames): ITrucoGameState {
  return dealSandboxRound(
    {
      id: `sandbox-${Date.now()}`,
      type: GameType.TRUCO,
      rulesName: "TrucoGameRules",
      players: [
        makePlayer(SANDBOX_YOU_ID, names.you, "TEAM_A"),
        makePlayer(SANDBOX_BOT_ID, names.bot, "TEAM_B"),
      ],
      bunch: [],
      status: GameStatus.PLAYING,
      playerTurn: SANDBOX_YOU_ID,
      deck: asStateDeck([]),
      rewardsApplied: false,
      vira: null,
      manilha: "",
      currentBet: 1,
      trucoState: "NONE",
      trucoAskerId: null,
      rounds: 0,
      teams: [
        { id: "TEAM_A", userIds: [SANDBOX_YOU_ID], roundWins: 0, score: 0 },
        { id: "TEAM_B", userIds: [SANDBOX_BOT_ID], roundWins: 0, score: 0 },
      ],
      handsResults: [],
      activeEffects: [],
      powerUsages: [],
    },
    names
  );
}

/** Soma os pontos (com Mercenário) e encerra a partida ou abre outra mão. Muta `game`. */
function finishRound(
  game: ITrucoGameState,
  winner: Team,
  points: number
): ITrucoGameState {
  winner.score += points;
  game.activeEffects
    .filter(
      (effect) =>
        effect.powerId === PowerId.MERCENARY &&
        winner.userIds.includes(effect.sourceUserId)
    )
    .forEach(() => applyMercenarySteal(game.teams, winner));

  if (winner.score >= TRUCO_WINNING_SCORE) {
    game.status = GameStatus.FINISHED;
    return game;
  }
  return dealSandboxRound(game);
}

function resolveTrick(game: ITrucoGameState): ITrucoGameState {
  restoreIllusions(game);

  const entries = game.bunch.map((card) => ({
    card,
    userId: ownerOf(game, card),
  }));
  const outcome = resolveTrickWinner(entries, game.manilha, game.teams);

  game.teams.forEach((team) => {
    if (outcome.isTie || team.id === outcome.winnerTeamId) team.roundWins += 1;
  });
  game.handsResults.push({
    winnerTeamId: outcome.winnerTeamId,
    bunch: game.bunch,
    isTie: outcome.isTie,
    round: game.rounds,
  });
  game.bunch = [];

  const roundResults = game.handsResults.filter(
    (result) => result.round === game.rounds
  );
  const round = resolveRoundOutcome(game.teams, roundResults);
  if (round.kind === "won")
    return finishRound(game, round.team, game.currentBet);
  if (round.kind === "void") return dealSandboxRound(game);

  setTurn(game, outcome.winnerUserId ?? game.playerTurn);
  return game;
}

// ---------------------------------------------------------------------------
// Poderes carimbados (espelha `applyPlayedCardPower` + strategies do backend)
// ---------------------------------------------------------------------------

function pickOpponent(
  game: ITrucoGameState,
  userId: string
): BasePlayer | undefined {
  const opponents = getOpponentTeam(game.teams, userId)?.userIds ?? [];
  return pickRandom(
    game.players.filter(
      (player) => opponents.includes(player.userId) && player.hand.length > 0
    )
  );
}

function applyCardPower(
  game: ITrucoGameState,
  userId: string,
  played: Card
): PowerPrivateResult | undefined {
  const powerId = played.powerId;
  if (!powerId || !isPowerId(powerId)) return undefined;
  delete played.powerId;

  const usage: PowerUsage = {
    powerId,
    userId,
    round: game.rounds,
    trigger: "CARD",
  };
  let privateResult: PowerPrivateResult | undefined;

  switch (powerId) {
    case PowerId.GRAVEDIGGER: {
      const deckIndex = pickRandom(
        findGravediggerCandidates(game.deck.cards, played, game.manilha)
      );
      if (deckIndex === undefined) return undefined;
      const [replacement] = game.deck.cards.splice(deckIndex, 1);
      delete replacement.powerId;
      game.deck.cards.unshift({ ...played });

      const player = getPlayer(game, userId);
      player.playedCards[player.playedCards.length - 1] = replacement;
      game.bunch[game.bunch.length - 1] = replacement;
      usage.returnedCard = { ...played };
      usage.replacementCard = replacement;
      break;
    }
    case PowerId.X_RAY: {
      const target = pickOpponent(game, userId);
      const card = target && pickRandom(target.hand);
      if (!target || !card) return undefined;
      usage.targetUserId = target.userId;
      privateResult = {
        powerId,
        targetUserId: target.userId,
        card: { ...card },
      };
      break;
    }
    case PowerId.SIXTH_SENSE: {
      const target = pickOpponent(game, userId);
      if (!target) return undefined;
      usage.targetUserId = target.userId;
      privateResult = {
        powerId,
        targetUserId: target.userId,
        hasManilha: target.hand.some((card) => card.rank === game.manilha),
      };
      break;
    }
    case PowerId.ILLUSIONIST:
      // `played` é a mesma referência em `playedCards` e `bunch`.
      disguiseAsZap(played, game.manilha);
      break;
    case PowerId.CHANGE_TRUMP: {
      let vira = game.deck.cards.pop();
      while (vira && !isTrucoRank(vira.rank)) vira = game.deck.cards.pop();
      if (!vira) return undefined;
      delete vira.powerId;
      game.vira = vira;
      game.manilha = getNextRank(vira.rank);
      break;
    }
    case PowerId.SILVER_SHIELD:
    case PowerId.MERCENARY:
      game.activeEffects.push({
        id: `sandbox-${powerId}-${userId}-${game.rounds}`,
        powerId,
        sourceUserId: userId,
        targetUserId: userId,
        round: game.rounds,
      });
      break;
    default:
      // Silenciador / Atração Magnética: sem hooks na sandbox.
      break;
  }

  game.powerUsages.push(usage);
  return privateResult;
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------

export function playSandboxCard(
  game: ITrucoGameState,
  userId: string,
  card: Card
): SandboxPlayResult {
  if (game.status !== GameStatus.PLAYING) return { game };
  if (game.trucoState === "PENDING") return { game };
  if (game.playerTurn !== userId) return { game };

  const next = clone(game);
  const player = getPlayer(next, userId);
  const index = player.hand.findIndex((item) => sameCard(item, card));
  if (index < 0) return { game };

  const [played] = player.hand.splice(index, 1);
  player.playedCards.push(played);
  next.bunch.push(played);
  player.status = PlayerStatus.WAITING;

  const privateResult = applyCardPower(next, userId, played);

  if (next.bunch.length >= next.players.length) {
    return { game: resolveTrick(next), privateResult };
  }

  const other = next.players.find((item) => item.userId !== userId);
  if (other) setTurn(next, other.userId);
  return { game: next, privateResult };
}

export function pickRandomHandCard(hand: Card[]): Card | null {
  return pickRandom(hand) ?? null;
}

export function addCardToSandboxHand(
  game: ITrucoGameState,
  userId: string,
  card: Card
): ITrucoGameState {
  const next = clone(game);
  getPlayer(next, userId).hand.push({ ...card });
  return next;
}

export function askSandboxTruco(
  game: ITrucoGameState,
  userId: string
): ITrucoGameState {
  if (game.status !== GameStatus.PLAYING) return game;
  if (game.currentBet >= TRUCO_MAX_BET) return game;

  const askingTeam = findTeamByUserId(game.teams, userId);
  const lastAskerTeam = game.trucoAskerId
    ? findTeamByUserId(game.teams, game.trucoAskerId)
    : undefined;
  if (askingTeam && lastAskerTeam && askingTeam.id === lastAskerTeam.id) {
    return game;
  }

  const next = clone(game);
  next.currentBet = nextTrucoBet(next.currentBet);
  next.trucoState = "PENDING";
  next.trucoAskerId = userId;
  return next;
}

export function acceptSandboxTruco(
  game: ITrucoGameState,
  userId: string
): ITrucoGameState {
  if (game.trucoState !== "PENDING" || !game.trucoAskerId) return game;
  const acceptingTeam = findTeamByUserId(game.teams, userId);
  const askingTeam = findTeamByUserId(game.teams, game.trucoAskerId);
  if (!acceptingTeam || acceptingTeam.id === askingTeam?.id) return game;

  return { ...game, trucoState: "ACCEPTED" };
}

/** O time que não pediu corre; quem pediu leva a aposta anterior (ou 1 com Escudo). */
export function rejectSandboxTruco(game: ITrucoGameState): ITrucoGameState {
  if (game.trucoState !== "PENDING" || !game.trucoAskerId) return game;

  const next = clone(game);
  const askingTeam = findTeamByUserId(next.teams, next.trucoAskerId!);
  if (!askingTeam) return game;

  const defendingHasShield = next.activeEffects.some(
    (effect) =>
      effect.powerId === PowerId.SILVER_SHIELD &&
      findTeamByUserId(next.teams, effect.targetUserId)?.id !== askingTeam.id
  );
  const points = defendingHasShield
    ? SILVER_SHIELD_REJECT_POINTS
    : trucoRejectPoints(next.currentBet);

  return finishRound(next, askingTeam, points);
}
