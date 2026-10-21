import type { Card } from "../../cards";
import type { HandResult, Team } from "../../types/game";
import { resolveRoundOutcome, resolveTrickWinner } from "./trick";

const card = (rank: string, suit: string): Card =>
  ({ rank, suit, toString: `${rank} of ${suit}` }) as unknown as Card;

const makeTeams = (aWins = 0, bWins = 0): Team[] => [
  { id: "TEAM_A", userIds: ["p1", "p3"], roundWins: aWins, score: 0 },
  { id: "TEAM_B", userIds: ["p2", "p4"], roundWins: bWins, score: 0 },
];

const hand = (winnerTeamId: Team["id"] | null): HandResult => ({
  winnerTeamId,
  bunch: [],
  isTie: winnerTeamId === null,
  round: 1,
});

const MANILHA = "Q";

describe("resolveTrickWinner", () => {
  it("returns no winner for an empty trick", () => {
    expect(resolveTrickWinner([], MANILHA, makeTeams())).toEqual({
      winnerUserId: null,
      winnerTeamId: null,
      isTie: false,
    });
  });

  it("gives the trick to the highest card", () => {
    const outcome = resolveTrickWinner(
      [
        { userId: "p1", card: card("K", "hearts") },
        { userId: "p2", card: card("3", "spades") },
      ],
      MANILHA,
      makeTeams()
    );
    expect(outcome).toEqual({
      winnerUserId: "p2",
      winnerTeamId: "TEAM_B",
      isTie: false,
    });
  });

  it("manilha beats any common card and suit breaks manilha ties", () => {
    const outcome = resolveTrickWinner(
      [
        { userId: "p1", card: card("Q", "diamonds") },
        { userId: "p2", card: card("3", "clubs") },
        { userId: "p3", card: card("Q", "clubs") },
      ],
      MANILHA,
      makeTeams()
    );
    expect(outcome.winnerUserId).toBe("p3");
    expect(outcome.winnerTeamId).toBe("TEAM_A");
  });

  it("ties (voids the trick) when the top cards belong to different teams", () => {
    const outcome = resolveTrickWinner(
      [
        { userId: "p1", card: card("3", "hearts") },
        { userId: "p2", card: card("3", "spades") },
      ],
      MANILHA,
      makeTeams()
    );
    expect(outcome).toEqual({
      winnerUserId: null,
      winnerTeamId: null,
      isTie: true,
    });
  });

  it("between partners, the first to play the top card wins", () => {
    const outcome = resolveTrickWinner(
      [
        { userId: "p1", card: card("3", "hearts") },
        { userId: "p2", card: card("K", "spades") },
        { userId: "p3", card: card("3", "diamonds") },
      ],
      MANILHA,
      makeTeams()
    );
    expect(outcome).toEqual({
      winnerUserId: "p1",
      winnerTeamId: "TEAM_A",
      isTie: false,
    });
  });
});

describe("resolveRoundOutcome", () => {
  it("continues while fewer than two tricks were played", () => {
    expect(resolveRoundOutcome(makeTeams(1, 0), [hand("TEAM_A")])).toEqual({
      kind: "continue",
    });
  });

  it("a team with two trick wins takes the round", () => {
    const teams = makeTeams(2, 0);
    expect(
      resolveRoundOutcome(teams, [hand("TEAM_A"), hand("TEAM_A")])
    ).toEqual({ kind: "won", team: teams[0] });
  });

  it("continues to the third trick when it is 1 x 1", () => {
    expect(
      resolveRoundOutcome(makeTeams(1, 1), [hand("TEAM_A"), hand("TEAM_B")])
    ).toEqual({ kind: "continue" });
  });

  it("after a tied first trick, the next trick winner takes the round", () => {
    // Empate conta para ambos: 1º empate -> 1x1, 2º para B -> 1x2.
    const teams = makeTeams(1, 2);
    expect(resolveRoundOutcome(teams, [hand(null), hand("TEAM_B")])).toEqual({
      kind: "won",
      team: teams[1],
    });
  });

  it("third trick tied: whoever won the first trick takes the round", () => {
    const teams = makeTeams(2, 2);
    expect(
      resolveRoundOutcome(teams, [hand("TEAM_B"), hand("TEAM_A"), hand(null)])
    ).toEqual({ kind: "won", team: teams[1] });
  });

  it("all three tricks tied: nobody scores", () => {
    expect(
      resolveRoundOutcome(makeTeams(3, 3), [hand(null), hand(null), hand(null)])
    ).toEqual({ kind: "void" });
  });
});
