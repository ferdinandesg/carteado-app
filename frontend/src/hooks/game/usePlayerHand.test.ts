import { renderHook } from "@testing-library/react";
import { Card } from "shared/cards";
import { IGameState, PlayerStatus } from "shared/game";

import { useGameStore } from "@/contexts/game.store";

import { usePlayerHand } from "./usePlayerHand";

const makeCard = (value: Card["value"]): Card => ({
  value,
  suit: "hearts",
  rank: "A",
  secondaryValue: null,
  toString: "A of hearts",
});

describe("usePlayerHand", () => {
  beforeEach(() => {
    useGameStore.setState({
      userId: "user-1",
      game: {
        players: [
          {
            userId: "user-1",
            name: "Player",
            status: PlayerStatus.PLAYING,
            hand: [makeCard(7), makeCard(3), makeCard(10)],
            playedCards: [],
            table: [],
            teamId: "team-1",
          },
        ],
      } as unknown as IGameState,
    });
  });

  it("returns hand sorted by value without mutating store", () => {
    const { result } = renderHook(() => usePlayerHand());

    expect(result.current.map((card) => card.value)).toEqual([3, 7, 10]);
    expect(
      useGameStore.getState().game!.players[0].hand.map((card) => card.value)
    ).toEqual([7, 3, 10]);
  });
});
