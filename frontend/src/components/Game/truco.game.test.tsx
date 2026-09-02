import fs from "node:fs";
import path from "node:path";
import { act, render, screen, waitFor } from "@testing-library/react";
import { ITrucoGameState, PowerId } from "shared/game";

import { useGameStore } from "@/contexts/game.store";
import { testIds } from "@/tests/testIds";

import TrucoGame from "./truco.game";

jest.mock("@/components/buttons/withSound", () => ({
  withSound: (Component: unknown) => Component,
}));

jest.mock("@/hooks/game/useGameActions", () => ({
  useGameActions: () => ({
    playCard: jest.fn(),
    askTruco: jest.fn(),
    acceptTruco: jest.fn(),
    rejectTruco: jest.fn(),
  }),
}));

const fixtures = JSON.parse(
  fs.readFileSync(
    path.resolve(
      __dirname,
      "../../../../shared/testFixtures/gameStatePayloads.json"
    ),
    "utf-8"
  )
) as { truco: Record<string, ITrucoGameState> };

const setGame = (game: ITrucoGameState) =>
  act(() => {
    useGameStore.setState({ game });
  });

describe("TrucoGame", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    act(() => {
      useGameStore.setState({ game: null, userId: "user-a", powerPeek: null });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders the 3x3 table with hand, bet chip and both trick piles", () => {
    setGame(fixtures.truco.roundStart);
    render(<TrucoGame />);

    expect(screen.getByTestId(testIds.game.table)).toBeInTheDocument();
    expect(screen.getByTestId(testIds.game.cardFan)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByTestId(testIds.game.currentBet)).toHaveTextContent("1");
    expect(screen.getByTestId(testIds.game.trickPileOurs)).toBeInTheDocument();
    expect(
      screen.getByTestId(testIds.game.trickPileOpponent)
    ).toBeInTheDocument();
  });

  it("shows the TRUCO stamp when truco is asked and clears it afterwards", async () => {
    setGame(fixtures.truco.roundStart);
    render(<TrucoGame />);

    setGame(fixtures.truco.trucoPending);
    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(screen.getByTestId(testIds.game.trucoStamp)).toHaveTextContent(
      "Truco.stamp.truco"
    );
    expect(screen.getByTestId(testIds.game.currentBet)).toHaveTextContent("3");

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() =>
      expect(
        screen.queryByTestId(testIds.game.trucoStamp)
      ).not.toBeInTheDocument()
    );
  });

  it("shows a power stamp when a card power is used", () => {
    setGame(fixtures.truco.roundStart);
    render(<TrucoGame />);

    setGame({
      ...fixtures.truco.roundStart,
      playerTurn: "user-b",
      bunch: [
        {
          rank: "K",
          suit: "hearts",
          value: 13,
          secondaryValue: null,
          toString: "K of hearts",
        },
      ],
      powerUsages: [
        {
          powerId: PowerId.X_RAY,
          userId: "user-a",
          targetUserId: "user-b",
          round: 1,
          trigger: "CARD",
        },
      ],
    });
    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(screen.getByTestId(testIds.game.trucoStamp)).toHaveTextContent(
      "Truco.stamp.power"
    );
  });

  it("reveals the peeked card only after a private X-Ray result", async () => {
    setGame(fixtures.truco.roundStart);
    render(<TrucoGame />);

    act(() => {
      useGameStore.setState({
        powerPeek: {
          powerId: PowerId.X_RAY,
          targetUserId: "user-b",
          card: fixtures.truco.roundStart.players[1].hand[0],
        },
      });
    });

    expect(screen.getByTestId(testIds.game.xrayPeek)).toBeInTheDocument();
    expect(screen.getByAltText("J of spades")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() =>
      expect(
        screen.queryByTestId(testIds.game.xrayPeek)
      ).not.toBeInTheDocument()
    );
  });
});
