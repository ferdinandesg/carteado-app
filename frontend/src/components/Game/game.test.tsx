import { render, screen } from "@testing-library/react";
import { GameStatus } from "shared/game";
import { RoomInterface } from "shared/types";

import Game from "@/components/Game/game";
import { useGameStore } from "@/contexts/game.store";
import { useRoomContext } from "@/contexts/room.context";
import { testIds } from "@/tests/testIds";

jest.mock("@/components/buttons/withSound", () => ({
  withSound: (Component: unknown) => Component,
}));

jest.mock("@/contexts/room.context", () => ({
  useRoomContext: jest.fn(),
}));

jest.mock("./carteado.game", () => ({
  __esModule: true,
  default: () => <div>carteado-game</div>,
}));

jest.mock("./truco.game", () => ({
  __esModule: true,
  default: () => <div>truco-game</div>,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);

const baseRoom: RoomInterface = {
  id: "room-id",
  hash: "abcd",
  name: "Sala Teste",
  status: "open",
  size: 2,
  participants: [],
  rule: "CarteadoGameRules",
  createdAt: "2026-01-01T00:00:00.000Z",
  ownerId: "user-1",
  owner: {
    id: "user-1",
    name: "Owner",
    email: "owner@example.com",
    image: "/avatar.png",
  },
};

describe("Game", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGameStore.setState({ game: null, userId: "user-1", powerPeek: null });
  });

  it("renders nothing while room is loading", () => {
    (useRoomContext as jest.Mock).mockReturnValue({
      room: null,
      isLoading: true,
    });

    const { container } = render(<Game />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders CarteadoGame for CarteadoGameRules", () => {
    (useRoomContext as jest.Mock).mockReturnValue({
      room: baseRoom,
      isLoading: false,
    });

    render(<Game />);
    expect(screen.getByText("carteado-game")).toBeInTheDocument();
  });

  it("renders TrucoGame for TrucoGameRules", () => {
    (useRoomContext as jest.Mock).mockReturnValue({
      room: { ...baseRoom, rule: "TrucoGameRules" },
      isLoading: false,
    });

    render(<Game />);
    expect(screen.getByText("truco-game")).toBeInTheDocument();
  });

  it("declares the match over when a team reaches 12 points", () => {
    useGameStore.setState({
      userId: "user-a",
      game: {
        id: "match-1",
        type: "TRUCO",
        status: GameStatus.FINISHED,
        rulesName: "TrucoGameRules",
        playerTurn: "user-a",
        bunch: [],
        deck: { cards: [], numberOfFullDecks: 1 },
        players: [
          {
            userId: "user-a",
            name: "Ana",
            status: "waiting",
            hand: [],
            table: [],
            playedCards: [],
            teamId: "TEAM_A",
          },
          {
            userId: "user-b",
            name: "Beto",
            status: "waiting",
            hand: [],
            table: [],
            playedCards: [],
            teamId: "TEAM_B",
          },
        ],
        teams: [
          { id: "TEAM_A", userIds: ["user-a"], roundWins: 0, score: 12 },
          { id: "TEAM_B", userIds: ["user-b"], roundWins: 0, score: 3 },
        ],
        vira: null,
        manilha: "Q",
        currentBet: 1,
        trucoState: "NONE",
        trucoAskerId: null,
        rounds: 4,
        handsResults: [],
        activeEffects: [],
        powerUsages: [],
      },
    });
    (useRoomContext as jest.Mock).mockReturnValue({
      room: { ...baseRoom, rule: "TrucoGameRules", status: "finished" },
      isLoading: false,
    });

    render(<Game />);
    expect(screen.getByTestId(testIds.game.finishedModal)).toHaveTextContent(
      "Game.gameFinished"
    );
  });
});
