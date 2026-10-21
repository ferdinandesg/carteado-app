import type { Card } from "../../cards";
import type { ITrucoGameState } from "../game.types";
import {
  disguiseAsZap,
  ILLUSION_SUIT,
  maskIllusionsForViewer,
  restoreIllusion,
  restoreIllusions,
  withoutIllusion,
} from "./illusion";

const card = (rank: string, suit: string): Card =>
  ({
    rank,
    suit,
    value: 0,
    secondaryValue: null,
    toString: `${rank} of ${suit}`,
  }) as unknown as Card;

describe("illusion (Ilusionista)", () => {
  it("disguises a card as the zap and keeps the real identity", () => {
    const real = card("4", "hearts");
    disguiseAsZap(real, "Q");

    expect(real.rank).toBe("Q");
    expect(real.suit).toBe(ILLUSION_SUIT);
    expect(real.toString).toBe("Q of clubs");
    expect(real.illusionReal).toEqual({
      rank: "4",
      suit: "hearts",
      toString: "4 of hearts",
    });
  });

  it("does not disguise twice nor without a manilha", () => {
    const twice = card("4", "hearts");
    disguiseAsZap(twice, "Q");
    disguiseAsZap(twice, "K");
    expect(twice.rank).toBe("Q");
    expect(twice.illusionReal?.rank).toBe("4");

    const noManilha = card("5", "spades");
    disguiseAsZap(noManilha, "");
    expect(noManilha.illusionReal).toBeUndefined();
    expect(noManilha.rank).toBe("5");
  });

  it("restores the real card", () => {
    const disguised = card("4", "hearts");
    disguiseAsZap(disguised, "Q");
    restoreIllusion(disguised);

    expect(disguised.rank).toBe("4");
    expect(disguised.suit).toBe("hearts");
    expect(disguised.toString).toBe("4 of hearts");
    expect(disguised.illusionReal).toBeUndefined();
  });

  it("restores every disguised card on the table and in played cards", () => {
    const onTable = card("4", "hearts");
    const played = card("5", "spades");
    disguiseAsZap(onTable, "Q");
    disguiseAsZap(played, "Q");

    restoreIllusions({
      bunch: [onTable],
      players: [{ playedCards: [played] }],
    });

    expect(onTable.rank).toBe("4");
    expect(played.rank).toBe("5");
  });

  it("withoutIllusion strips the secret without mutating the card", () => {
    const disguised = card("4", "hearts");
    disguiseAsZap(disguised, "Q");

    const masked = withoutIllusion(disguised);
    expect(masked.illusionReal).toBeUndefined();
    expect(masked.rank).toBe("Q");
    expect(disguised.illusionReal).toBeDefined();

    const plain = card("K", "spades");
    expect(withoutIllusion(plain)).toBe(plain);
  });

  describe("maskIllusionsForViewer", () => {
    const buildState = (): ITrucoGameState => {
      const disguised = card("4", "hearts");
      disguiseAsZap(disguised, "Q");
      return {
        bunch: [disguised],
        players: [
          { userId: "p1", playedCards: [{ ...disguised }] },
          { userId: "p2", playedCards: [] },
          { userId: "p3", playedCards: [] },
        ],
        teams: [
          { id: "TEAM_A", userIds: ["p1", "p3"], roundWins: 0, score: 0 },
          { id: "TEAM_B", userIds: ["p2"], roundWins: 0, score: 0 },
        ],
      } as unknown as ITrucoGameState;
    };

    it("keeps the secret for the owner's team", () => {
      const state = buildState();
      const forPartner = maskIllusionsForViewer(state, "p3");
      expect(forPartner.bunch[0].illusionReal).toBeDefined();
      expect(forPartner.players[0].playedCards[0].illusionReal).toBeDefined();
    });

    it("hides the secret from opponents without mutating the state", () => {
      const state = buildState();
      const forOpponent = maskIllusionsForViewer(state, "p2");
      expect(forOpponent.bunch[0].illusionReal).toBeUndefined();
      expect(
        forOpponent.players[0].playedCards[0].illusionReal
      ).toBeUndefined();
      expect(state.bunch[0].illusionReal).toBeDefined();
    });

    it("returns the same object when there is no secret", () => {
      const state = {
        bunch: [card("K", "spades")],
        players: [{ userId: "p1", playedCards: [] }],
        teams: [],
      } as unknown as ITrucoGameState;
      expect(maskIllusionsForViewer(state, "p2")).toBe(state);
    });
  });
});
