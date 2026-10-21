import type { Team } from "../../types/game";
import {
  applyMercenarySteal,
  nextTrucoBet,
  SILVER_SHIELD_REJECT_POINTS,
  TRUCO_BET_LADDER,
  TRUCO_MAX_BET,
  TRUCO_WINNING_SCORE,
  trucoRejectPoints,
} from "./scoring";

const team = (id: Team["id"], score: number): Team => ({
  id,
  userIds: [],
  roundWins: 0,
  score,
});

describe("truco scoring", () => {
  it("climbs the bet ladder 1 -> 3 -> 6 -> 9 -> 12", () => {
    const steps = [1];
    while (steps[steps.length - 1] < TRUCO_MAX_BET) {
      steps.push(nextTrucoBet(steps[steps.length - 1]));
    }
    expect(steps).toEqual([1, 3, 6, 9, 12]);
    expect(TRUCO_BET_LADDER).toEqual({ 1: 3, 3: 6, 6: 9, 9: 12 });
  });

  it("falls back to truco (3) for values outside the ladder", () => {
    expect(nextTrucoBet(12)).toBe(3);
    expect(nextTrucoBet(7)).toBe(3);
  });

  it.each([
    [3, 1],
    [6, 3],
    [9, 6],
    [12, 9],
  ])("running from a bet of %i gives the asker %i point(s)", (bet, points) => {
    expect(trucoRejectPoints(bet)).toBe(points);
  });

  it("running when no raise is on the table is worth 1", () => {
    expect(trucoRejectPoints(1)).toBe(1);
  });

  it("keeps the match and shield constants stable", () => {
    expect(TRUCO_WINNING_SCORE).toBe(12);
    expect(SILVER_SHIELD_REJECT_POINTS).toBe(1);
  });

  describe("applyMercenarySteal", () => {
    it("moves one point from the loser to the winner", () => {
      const winner = team("TEAM_A", 5);
      const loser = team("TEAM_B", 4);
      applyMercenarySteal([winner, loser], winner);
      expect(winner.score).toBe(6);
      expect(loser.score).toBe(3);
    });

    it("never takes the loser below zero", () => {
      const winner = team("TEAM_B", 2);
      const loser = team("TEAM_A", 0);
      applyMercenarySteal([loser, winner], winner);
      expect(winner.score).toBe(3);
      expect(loser.score).toBe(0);
    });
  });
});
