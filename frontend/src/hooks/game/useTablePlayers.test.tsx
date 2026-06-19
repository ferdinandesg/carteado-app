import { renderHook } from "@testing-library/react";
import { IGameState, PlayerStatus } from "shared/game";

import { useGameStore } from "@/contexts/game.store";

import { useTablePlayers } from "./useTablePlayers";

const makePlayer = (userId: string, name: string) => ({
  userId,
  name,
  status: PlayerStatus.PLAYING,
  hand: [],
  playedCards: [],
  table: [],
  teamId: `team-${userId}`,
});

describe("useTablePlayers", () => {
  beforeEach(() => {
    useGameStore.setState({ userId: "user-1" });
  });

  it("orders opponents clockwise from the main player", () => {
    const game = {
      playerTurn: "user-1",
      players: [
        makePlayer("user-1", "Me"),
        makePlayer("user-2", "Left"),
        makePlayer("user-3", "Top"),
        makePlayer("user-4", "Right"),
      ],
    } as unknown as IGameState;

    const { result } = renderHook(() => useTablePlayers(game));

    expect(result.current.mainPlayer?.userId).toBe("user-1");
    expect(
      result.current.orderedOpponents.map((player) => player.userId)
    ).toEqual(["user-2", "user-3", "user-4"]);
  });

  it("returns empty state when userId is missing", () => {
    useGameStore.setState({ userId: null });

    const { result } = renderHook(() => useTablePlayers(null));

    expect(result.current).toEqual({
      mainPlayer: null,
      orderedOpponents: [],
    });
  });
});
