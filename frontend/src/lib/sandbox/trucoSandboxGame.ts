import Deck, {
  Card,
  getCardValue,
  getNextRank,
  RANK_TO_VALUE,
  TRUCO_RANK_ORDER,
  type Rank,
  type Suit,
} from "shared/cards";
import {
  BasePlayer,
  GameStatus,
  GameType,
  ITrucoGameState,
  PlayerStatus,
  PowerId,
  type PowerPrivateResult,
  type PowerUsage,
} from "shared/game";

export const SANDBOX_YOU_ID = "sandbox-you";
export const SANDBOX_BOT_ID = "sandbox-bot";
export const SANDBOX_BOT_DELAY_MS = 800;

const TRUCO_RANKS = new Set(Object.keys(TRUCO_RANK_ORDER));

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

function makePlayer(
  userId: string,
  name: string,
  extras: Partial<BasePlayer> = {}
): BasePlayer {
  return {
    userId,
    name,
    status: PlayerStatus.WAITING,
    hand: [],
    playedCards: [],
    table: [],
    teamId: extras.teamId ?? "",
    isBot: extras.isBot,
    ...extras,
  };
}

function drawTrucoCard(deck: Deck): Card {
  let card = deck.draw();
  while (card && !TRUCO_RANKS.has(card.rank) && deck.getCards().length > 0) {
    card = deck.draw();
  }
  if (!card || !TRUCO_RANKS.has(card.rank)) {
    throw new Error("SANDBOX_DECK_EMPTY");
  }
  return { ...card };
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function stampHands(hands: Card[][], manilha: string): void {
  const candidates = hands
    .flat()
    .filter((card) => card.rank !== manilha && TRUCO_RANKS.has(card.rank));
  const powers = shuffle(Object.values(PowerId));
  const count = Math.min(powers.length, candidates.length);
  const picked = shuffle(candidates).slice(0, count);
  for (let i = 0; i < count; i++) {
    picked[i].powerId = powers[i];
  }
}

function setTurn(game: ITrucoGameState, userId: string): ITrucoGameState {
  return {
    ...game,
    playerTurn: userId,
    players: game.players.map((player) => ({
      ...player,
      status:
        player.userId === userId ? PlayerStatus.PLAYING : PlayerStatus.WAITING,
    })),
  };
}

function leftoverDeck(deck: Deck): ITrucoGameState["deck"] {
  return {
    cards: deck.getCards().filter((card) => TRUCO_RANKS.has(card.rank)),
    numberOfFullDecks: 1,
  } as unknown as ITrucoGameState["deck"];
}

function emptyDeck(): ITrucoGameState["deck"] {
  return leftoverDeck({ getCards: () => [] } as unknown as Deck);
}

export function dealSandboxRound(
  game: ITrucoGameState,
  names?: { you: string; bot: string }
): ITrucoGameState {
  const deck = new Deck();
  const yourHand = [
    drawTrucoCard(deck),
    drawTrucoCard(deck),
    drawTrucoCard(deck),
  ];
  const botHand = [
    drawTrucoCard(deck),
    drawTrucoCard(deck),
    drawTrucoCard(deck),
  ];
  const vira = drawTrucoCard(deck);
  delete vira.powerId;
  const manilha = getNextRank(vira.rank);
  stampHands([yourHand, botHand], manilha);

  return setTurn(
    {
      ...game,
      rounds: game.rounds + 1,
      currentBet: 1,
      status: GameStatus.PLAYING,
      trucoState: "NONE",
      trucoAskerId: null,
      bunch: [],
      vira,
      manilha,
      deck: leftoverDeck(deck),
      activeEffects: [],
      players: game.players.map((player) => ({
        ...player,
        name:
          player.userId === SANDBOX_YOU_ID
            ? (names?.you ?? player.name)
            : (names?.bot ?? player.name),
        hand: player.userId === SANDBOX_YOU_ID ? yourHand : botHand,
        playedCards: [],
        table: [],
      })),
      teams: game.teams.map((team) => ({ ...team, roundWins: 0 })),
    },
    SANDBOX_YOU_ID
  );
}

export function createSandboxTrucoGame(names: {
  you: string;
  bot: string;
}): ITrucoGameState {
  const you = makePlayer(SANDBOX_YOU_ID, names.you, { teamId: "TEAM_A" });
  const bot = makePlayer(SANDBOX_BOT_ID, names.bot, {
    teamId: "TEAM_B",
    isBot: true,
  });

  return dealSandboxRound(
    {
      id: `sandbox-${Date.now()}`,
      type: GameType.TRUCO,
      rulesName: "TrucoGameRules",
      players: [you, bot],
      bunch: [],
      status: GameStatus.PLAYING,
      playerTurn: SANDBOX_YOU_ID,
      deck: emptyDeck(),
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

function sameCard(a: Card, b: Card) {
  return a.rank === b.rank && a.suit === b.suit;
}

function ownerId(game: ITrucoGameState, card: Card): string | null {
  return (
    game.players.find((player) =>
      player.playedCards.some((played) => sameCard(played, card))
    )?.userId ?? null
  );
}

function isPowerId(value: string): value is PowerId {
  return (Object.values(PowerId) as string[]).includes(value);
}

function applySandboxGravedigger(
  players: BasePlayer[],
  bunch: Card[],
  deckCards: Card[],
  manilha: string,
  userId: string
): {
  players: BasePlayer[];
  bunch: Card[];
  deckCards: Card[];
  returnedCard: Card;
  replacementCard: Card;
} | null {
  const actor = players.find((player) => player.userId === userId);
  const returnedCard = actor?.playedCards[actor.playedCards.length - 1];
  if (!actor || !returnedCard) return null;

  const minValue = getCardValue(returnedCard, manilha);
  const candidates = deckCards
    .map((card, index) => ({ card, index }))
    .filter(
      ({ card }) =>
        TRUCO_RANKS.has(card.rank) && getCardValue(card, manilha) >= minValue
    );
  if (candidates.length === 0) return null;

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  const replacementCard = { ...picked.card };
  delete replacementCard.powerId;

  const nextDeck = [...deckCards];
  nextDeck.splice(picked.index, 1);
  nextDeck.unshift({ ...returnedCard });

  const bunchIndex = bunch.length - 1;

  return {
    players: players.map((player) => {
      if (player.userId !== userId) return player;
      const playedCards = [...player.playedCards];
      playedCards[playedCards.length - 1] = replacementCard;
      return { ...player, playedCards };
    }),
    bunch: bunch.map((card, i) => (i === bunchIndex ? replacementCard : card)),
    deckCards: nextDeck,
    returnedCard,
    replacementCard,
  };
}

function applySandboxXRay(
  players: BasePlayer[],
  teams: ITrucoGameState["teams"],
  userId: string
): PowerPrivateResult | null {
  const sourceTeam = teams.find((team) => team.userIds.includes(userId));
  if (!sourceTeam) return null;

  const opponents = players.filter((player) => {
    const team = teams.find((item) => item.userIds.includes(player.userId));
    return Boolean(team && team.id !== sourceTeam.id && player.hand.length > 0);
  });
  if (opponents.length === 0) return null;

  const target = opponents[Math.floor(Math.random() * opponents.length)];
  const card = target.hand[Math.floor(Math.random() * target.hand.length)];
  if (!card) return null;

  return {
    powerId: PowerId.X_RAY,
    targetUserId: target.userId,
    card: { ...card },
  };
}

function roundShouldEnd(game: ITrucoGameState): boolean {
  const [teamA, teamB] = game.teams;
  const tricks = game.handsResults.filter(
    (result) => result.round === game.rounds
  ).length;
  if (tricks < 2) return false;
  if (teamA.roundWins >= 2 && teamA.roundWins > teamB.roundWins) return true;
  if (teamB.roundWins >= 2 && teamB.roundWins > teamA.roundWins) return true;
  return tricks >= 3;
}

function finishSandboxRound(game: ITrucoGameState): ITrucoGameState {
  const [teamA, teamB] = game.teams;
  const firstTrick = game.handsResults.find(
    (result) => result.round === game.rounds && result.winnerTeamId
  );
  const winner =
    teamA.roundWins > teamB.roundWins
      ? teamA
      : teamB.roundWins > teamA.roundWins
        ? teamB
        : (game.teams.find((team) => team.id === firstTrick?.winnerTeamId) ??
          null);

  const teams = game.teams.map((team) => ({
    ...team,
    roundWins: 0,
    score: team.score + (winner && team.id === winner.id ? game.currentBet : 0),
  }));

  const scored: ITrucoGameState = {
    ...game,
    teams,
    currentBet: 1,
    trucoState: "NONE",
    trucoAskerId: null,
  };

  if (teams.some((team) => team.score >= 12)) {
    return { ...scored, status: GameStatus.FINISHED };
  }

  return dealSandboxRound(scored);
}

function resolveTrick(game: ITrucoGameState): ITrucoGameState {
  const [first, second] = game.bunch;
  const firstValue = getCardValue(first, game.manilha);
  const secondValue = getCardValue(second, game.manilha);
  const isTie = firstValue === secondValue;
  const winnerUserId = isTie
    ? null
    : ownerId(game, firstValue > secondValue ? first : second);

  const winnerTeamId = winnerUserId
    ? (game.teams.find((team) => team.userIds.includes(winnerUserId))?.id ??
      null)
    : null;

  const teams = game.teams.map((team) => ({
    ...team,
    roundWins: team.roundWins + (isTie || team.id === winnerTeamId ? 1 : 0),
  }));

  const resolved: ITrucoGameState = {
    ...game,
    teams,
    bunch: [],
    handsResults: [
      ...game.handsResults,
      {
        winnerTeamId,
        bunch: game.bunch,
        isTie,
        round: game.rounds,
      },
    ],
  };

  if (roundShouldEnd(resolved)) {
    return finishSandboxRound(resolved);
  }

  return setTurn(resolved, SANDBOX_YOU_ID);
}

export type SandboxPlayResult = {
  game: ITrucoGameState;
  privateResult?: PowerPrivateResult;
};

export function playSandboxCard(
  game: ITrucoGameState,
  userId: string,
  card: Card
): SandboxPlayResult {
  if (game.status !== GameStatus.PLAYING) return { game };
  if (game.trucoState === "PENDING") return { game };
  if (game.playerTurn !== userId) return { game };

  const player = game.players.find((item) => item.userId === userId);
  if (!player) return { game };

  const index = player.hand.findIndex((item) => sameCard(item, card));
  if (index < 0) return { game };

  const played = { ...player.hand[index] };
  const powerId = played.powerId;
  delete played.powerId;

  let players = game.players.map((item) => {
    if (item.userId !== userId) return item;
    return {
      ...item,
      hand: item.hand.filter((_, i) => i !== index),
      playedCards: [...item.playedCards, played],
      status: PlayerStatus.WAITING,
    };
  });
  let bunch = [...game.bunch, played];
  let deckCards = [...(game.deck.cards ?? [])];
  let privateResult: PowerPrivateResult | undefined;

  const usages: PowerUsage[] = [...game.powerUsages];
  if (powerId && isPowerId(powerId)) {
    const usage: PowerUsage = {
      powerId,
      userId,
      round: game.rounds,
      trigger: "CARD",
    };

    if (powerId === PowerId.GRAVEDIGGER) {
      const swap = applySandboxGravedigger(
        players,
        bunch,
        deckCards,
        game.manilha,
        userId
      );
      if (swap) {
        players = swap.players;
        bunch = swap.bunch;
        deckCards = swap.deckCards;
        usage.returnedCard = swap.returnedCard;
        usage.replacementCard = swap.replacementCard;
        usages.push(usage);
      }
    } else {
      if (powerId === PowerId.X_RAY) {
        const peek = applySandboxXRay(players, game.teams, userId);
        if (peek) {
          usage.targetUserId = peek.targetUserId;
          privateResult = peek;
        }
      }
      usages.push(usage);
    }
  }

  const next: ITrucoGameState = {
    ...game,
    players,
    bunch,
    deck: { ...game.deck, cards: deckCards } as ITrucoGameState["deck"],
    powerUsages: usages,
  };

  if (next.bunch.length >= 2) {
    return { game: resolveTrick(next), privateResult };
  }

  const other = next.players.find((item) => item.userId !== userId);
  return {
    game: other ? setTurn(next, other.userId) : next,
    privateResult,
  };
}

export function pickRandomHandCard(hand: Card[]): Card | null {
  if (hand.length === 0) return null;
  return hand[Math.floor(Math.random() * hand.length)] ?? null;
}

export function addCardToSandboxHand(
  game: ITrucoGameState,
  userId: string,
  card: Card
): ITrucoGameState {
  return {
    ...game,
    players: game.players.map((player) =>
      player.userId === userId
        ? { ...player, hand: [...player.hand, { ...card }] }
        : player
    ),
  };
}

const TRUCO_BETS: Record<number, number> = { 1: 3, 3: 6, 6: 9, 9: 12 };

function teamOf(game: ITrucoGameState, userId: string) {
  return game.teams.find((team) => team.userIds.includes(userId));
}

export function askSandboxTruco(
  game: ITrucoGameState,
  userId: string
): ITrucoGameState {
  if (game.status !== GameStatus.PLAYING) return game;
  if (game.currentBet >= 12) return game;

  const askingTeam = teamOf(game, userId);
  const lastAskerTeam = game.trucoAskerId
    ? teamOf(game, game.trucoAskerId)
    : null;
  if (askingTeam && lastAskerTeam && askingTeam.id === lastAskerTeam.id) {
    return game;
  }

  return {
    ...game,
    currentBet: TRUCO_BETS[game.currentBet] ?? 3,
    trucoState: "PENDING",
    trucoAskerId: userId,
  };
}

export function acceptSandboxTruco(
  game: ITrucoGameState,
  userId: string
): ITrucoGameState {
  if (game.trucoState !== "PENDING" || !game.trucoAskerId) return game;
  const acceptingTeam = teamOf(game, userId);
  const askingTeam = teamOf(game, game.trucoAskerId);
  if (!acceptingTeam || acceptingTeam.id === askingTeam?.id) return game;

  return { ...game, trucoState: "ACCEPTED" };
}

export function rejectSandboxTruco(game: ITrucoGameState): ITrucoGameState {
  if (game.trucoState !== "PENDING" || !game.trucoAskerId) return game;
  const askingTeam = teamOf(game, game.trucoAskerId);
  if (!askingTeam) return game;

  const previousBet =
    Number(
      Object.entries(TRUCO_BETS).find(
        ([, value]) => value === game.currentBet
      )?.[0]
    ) || 1;

  const teams = game.teams.map((team) => ({
    ...team,
    roundWins: 0,
    score: team.score + (team.id === askingTeam.id ? previousBet : 0),
  }));

  const scored: ITrucoGameState = {
    ...game,
    teams,
    currentBet: 1,
    trucoState: "NONE",
    trucoAskerId: null,
    bunch: [],
  };

  if (teams.some((team) => team.score >= 12)) {
    return { ...scored, status: GameStatus.FINISHED };
  }

  return dealSandboxRound(scored);
}
