import { Card, Rank, Suit } from "shared/cards";
import {
  BasePlayer,
  GameStatus,
  GameType,
  ITrucoGameState,
  PlayerStatus,
  PowerId,
} from "shared/game";

import { diffTrucoSnapshots } from "./trucoTableEvents";

const card = (rank: Rank, suit: Suit): Card => ({
  rank,
  suit,
  value: 1,
  secondaryValue: null,
  toString: `${rank} of ${suit}`,
});

const player = (userId: string, teamId: string): BasePlayer => ({
  userId,
  name: userId,
  status: PlayerStatus.PLAYING,
  hand: [],
  playedCards: [],
  table: [],
  teamId,
});

function makeGame(overrides: Partial<ITrucoGameState> = {}): ITrucoGameState {
  return {
    id: "game-1",
    type: GameType.TRUCO,
    rulesName: "TrucoGameRules",
    status: GameStatus.PLAYING,
    players: [player("p1", "TEAM_A"), player("p2", "TEAM_B")],
    playerTurn: "p1",
    bunch: [],
    deck: { cards: [] } as unknown as ITrucoGameState["deck"],
    vira: null,
    manilha: "4",
    currentBet: 1,
    trucoState: "NONE",
    trucoAskerId: null,
    rounds: 1,
    teams: [
      { id: "TEAM_A", userIds: ["p1"], roundWins: 0, score: 0 },
      { id: "TEAM_B", userIds: ["p2"], roundWins: 0, score: 0 },
    ],
    handsResults: [],
    activeEffects: [],
    powerUsages: [],
    ...overrides,
  };
}

describe("diffTrucoSnapshots", () => {
  it("returns nothing without a previous snapshot", () => {
    expect(diffTrucoSnapshots(null, makeGame())).toEqual([]);
  });

  it("detects a played card attributed to the previous turn owner", () => {
    const prev = makeGame({ playerTurn: "p1" });
    const next = makeGame({
      playerTurn: "p2",
      bunch: [card("A", "spades")],
    });

    expect(diffTrucoSnapshots(prev, next)).toEqual([
      { type: "cardPlayed", card: card("A", "spades"), playerId: "p1" },
    ]);
  });

  it("emits the closing card and trickFinished when the bunch is cleared", () => {
    const prev = makeGame({
      playerTurn: "p2",
      bunch: [card("A", "spades")],
    });
    const result = {
      round: 1,
      bunch: [card("A", "spades"), card("3", "hearts")],
      isTie: false,
      winnerTeamId: "TEAM_B",
    };
    const next = makeGame({
      playerTurn: "p2",
      bunch: [],
      handsResults: [result],
      teams: [
        { id: "TEAM_A", userIds: ["p1"], roundWins: 0, score: 0 },
        { id: "TEAM_B", userIds: ["p2"], roundWins: 1, score: 0 },
      ],
    });

    expect(diffTrucoSnapshots(prev, next)).toEqual([
      { type: "cardPlayed", card: card("3", "hearts"), playerId: "p2" },
      { type: "trickFinished", result },
    ]);
  });

  it("detects truco asked and accepted", () => {
    const idle = makeGame();
    const pending = makeGame({
      trucoState: "PENDING",
      trucoAskerId: "p1",
      currentBet: 3,
    });
    const accepted = makeGame({
      trucoState: "ACCEPTED",
      trucoAskerId: "p1",
      currentBet: 3,
    });

    expect(diffTrucoSnapshots(idle, pending)).toEqual([
      { type: "trucoAsked", askerId: "p1", bet: 3 },
    ]);
    expect(diffTrucoSnapshots(pending, accepted)).toEqual([
      { type: "trucoAccepted", bet: 3 },
    ]);
  });

  it("detects a rejected truco as round end with the asker team scoring", () => {
    const pending = makeGame({
      trucoState: "PENDING",
      trucoAskerId: "p1",
      currentBet: 3,
    });
    const next = makeGame({
      rounds: 2,
      teams: [
        { id: "TEAM_A", userIds: ["p1"], roundWins: 0, score: 1 },
        { id: "TEAM_B", userIds: ["p2"], roundWins: 0, score: 0 },
      ],
    });

    expect(diffTrucoSnapshots(pending, next)).toEqual([
      { type: "trucoRejected", winnerTeamId: "TEAM_A", points: 1 },
      {
        type: "roundFinished",
        winnerTeamId: "TEAM_A",
        points: 1,
        previousRound: 1,
      },
    ]);
  });

  it("detects match end", () => {
    const prev = makeGame({ rounds: 5 });
    const next = makeGame({
      rounds: 5,
      status: GameStatus.FINISHED,
      teams: [
        { id: "TEAM_A", userIds: ["p1"], roundWins: 2, score: 12 },
        { id: "TEAM_B", userIds: ["p2"], roundWins: 0, score: 4 },
      ],
    });

    expect(diffTrucoSnapshots(prev, next)).toEqual([
      {
        type: "roundFinished",
        winnerTeamId: "TEAM_A",
        points: 12,
        previousRound: 5,
      },
      { type: "matchFinished", winnerTeamId: "TEAM_A" },
    ]);
  });

  it("emits powerUsed when a new PowerUsage appears", () => {
    const prev = makeGame();
    const next = makeGame({
      playerTurn: "p2",
      bunch: [card("K", "hearts")],
      powerUsages: [
        {
          powerId: PowerId.X_RAY,
          userId: "p1",
          targetUserId: "p2",
          round: 1,
          trigger: "CARD",
        },
      ],
    });

    expect(diffTrucoSnapshots(prev, next)).toEqual([
      { type: "cardPlayed", card: card("K", "hearts"), playerId: "p1" },
      {
        type: "powerUsed",
        powerId: PowerId.X_RAY,
        userId: "p1",
        targetUserId: "p2",
      },
    ]);
  });

  it("forwards Coveiro swap cards on powerUsed", () => {
    const played = card("4", "diamonds");
    const fromHand = card("K", "hearts");
    const prev = makeGame({ bunch: [played] });
    const next = makeGame({
      playerTurn: "p2",
      bunch: [fromHand],
      powerUsages: [
        {
          powerId: PowerId.GRAVEDIGGER,
          userId: "p1",
          round: 1,
          trigger: "CARD",
          returnedCard: played,
          replacementCard: fromHand,
        },
      ],
    });

    expect(diffTrucoSnapshots(prev, next)).toEqual([
      { type: "cardPlayed", card: fromHand, playerId: "p1" },
      {
        type: "powerUsed",
        powerId: PowerId.GRAVEDIGGER,
        userId: "p1",
        returnedCard: played,
        replacementCard: fromHand,
      },
    ]);
  });
});
