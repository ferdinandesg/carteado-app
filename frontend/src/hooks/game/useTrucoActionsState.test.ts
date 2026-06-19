import { renderHook } from "@testing-library/react";
import { IGameState, PlayerStatus } from "shared/game";

import { useGameStore } from "@/contexts/game.store";

import { useTrucoActionsState } from "./useTrucoActionsState";

describe("useTrucoActionsState", () => {
  beforeEach(() => {
    useGameStore.setState({
      userId: "user-1",
      game: {
        type: "TRUCO",
        trucoState: "PENDING",
        trucoAskerId: "user-2",
        teams: [
          { id: "TEAM_A", userIds: ["user-1", "user-3"], score: 0 },
          { id: "TEAM_B", userIds: ["user-2", "user-4"], score: 0 },
        ],
        players: [
          {
            userId: "user-1",
            name: "P1",
            status: PlayerStatus.PLAYING,
            hand: [],
            playedCards: [],
            table: [],
            teamId: "TEAM_A",
          },
        ],
      } as unknown as IGameState,
    });
  });

  it("allows accept/reject when truco was asked by the opposing team", () => {
    const { result } = renderHook(() => useTrucoActionsState());

    expect(result.current.canAcceptReject).toBe(true);
    expect(result.current.canAskTruco).toBe(false);
  });

  it("blocks accept/reject when truco was asked by the same team", () => {
    useGameStore.setState((state) => ({
      game: state.game
        ? {
            ...state.game,
            trucoAskerId: "user-3",
          }
        : null,
    }));

    const { result } = renderHook(() => useTrucoActionsState());

    expect(result.current.canAcceptReject).toBe(false);
    expect(result.current.canAskTruco).toBe(false);
  });
});
