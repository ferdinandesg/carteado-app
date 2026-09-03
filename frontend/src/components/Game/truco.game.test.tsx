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

    const stamp = screen.getByTestId(testIds.game.trucoStamp);
    expect(stamp).toHaveTextContent("Truco.stamp.power");
    expect(stamp).toHaveAttribute("data-power-id", PowerId.X_RAY);
    expect(stamp).toHaveAttribute("data-target-user-id", "user-b");
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

    const peek = screen.getByTestId(testIds.game.xrayPeek);
    expect(peek).toBeInTheDocument();
    expect(peek).toHaveAttribute("data-target-user-id", "user-b");
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

  it("anchors X-Ray on the targeted side seat in a 4-player table", () => {
    const base = fixtures.truco.roundStart;
    const clone = (userId: string) => ({
      ...base.players[1],
      userId,
      name: userId,
      hand: [...base.players[1].hand],
    });
    setGame({
      ...base,
      players: [
        base.players[0],
        clone("user-b"),
        clone("user-c"),
        clone("user-d"),
      ],
      teams: [
        { id: "TEAM_A", userIds: ["user-a", "user-c"], roundWins: 0, score: 0 },
        { id: "TEAM_B", userIds: ["user-b", "user-d"], roundWins: 0, score: 0 },
      ],
    });
    render(<TrucoGame />);

    act(() => {
      useGameStore.setState({
        powerPeek: {
          powerId: PowerId.X_RAY,
          targetUserId: "user-d",
          card: clone("user-d").hand[0],
        },
      });
    });

    expect(screen.getByTestId(testIds.game.xrayPeek)).toHaveAttribute(
      "data-target-user-id",
      "user-d"
    );
    expect(
      screen.getByText("user-d").closest("[data-user-id='user-d']")?.className
    ).toMatch(/highlighted/);
  });

  it("shows a yes/no radar stamp after a private Sixth Sense result", async () => {
    setGame(fixtures.truco.roundStart);
    render(<TrucoGame />);

    act(() => {
      useGameStore.setState({
        powerPeek: {
          powerId: PowerId.SIXTH_SENSE,
          targetUserId: "user-b",
          hasManilha: true,
        },
      });
    });

    const radar = screen.getByTestId(testIds.game.radarPeek);
    expect(radar).toHaveTextContent("Powers.SIXTH_SENSE.yes");
    expect(radar).toHaveAttribute("data-target-user-id", "user-b");

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() =>
      expect(
        screen.queryByTestId(testIds.game.radarPeek)
      ).not.toBeInTheDocument()
    );
  });

  it("lists active round effects next to the vira in slot 1", () => {
    setGame({
      ...fixtures.truco.roundStart,
      activeEffects: [
        {
          id: "fx-1",
          powerId: PowerId.SILENCER,
          sourceUserId: "user-a",
          targetUserId: "user-b",
          round: 1,
        },
        {
          id: "fx-2",
          powerId: PowerId.MERCENARY,
          sourceUserId: "user-a",
          targetUserId: "user-a",
          round: 1,
        },
      ],
    });
    render(<TrucoGame />);

    const effects = screen.getByTestId(testIds.game.activeEffects);
    expect(effects).toHaveTextContent("Powers.SILENCER.name");
    expect(effects).toHaveTextContent("Powers.MERCENARY.name");

    const hints = screen.getAllByRole("tooltip");
    expect(hints).toHaveLength(2);
    expect(hints[0]).toHaveTextContent("Powers.SILENCER.description");
    expect(hints[1]).toHaveTextContent("Powers.MERCENARY.description");
  });
});
