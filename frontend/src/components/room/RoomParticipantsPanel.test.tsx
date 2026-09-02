import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameStatus, IGameState, PlayerStatus } from "shared/game";

import RoomParticipantsPanel from "@/components/room/RoomParticipantsPanel";
import { useGameStore } from "@/contexts/game.store";
import { useRoomContext } from "@/contexts/room.context";
import { useSocket } from "@/contexts/socket.context";
import { RoomInterface } from "shared/types";
import { testIds } from "@/tests/testIds";

const mockPush = jest.fn();
const mockEmit = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/components/buttons/withSound", () => ({
  withSound: (Component: unknown) => Component,
}));

jest.mock("@/contexts/room.context", () => ({
  useRoomContext: jest.fn(),
}));

jest.mock("@/contexts/socket.context", () => {
  const useSocket = jest.fn();
  return {
    useSocket,
    useOptionalSocket: useSocket,
  };
});

const mockRoom: RoomInterface = {
  id: "room-id",
  hash: "abcd",
  name: "Sala Teste",
  status: "open",
  size: 4,
  participants: [
    {
      userId: "user-1",
      socketId: "socket-1",
      name: "Owner",
      status: PlayerStatus.READY,
      isRegistered: true,
      isOnline: true,
    },
    {
      userId: "user-2",
      socketId: "socket-2",
      name: "Guest",
      status: PlayerStatus.NOT_READY,
      isRegistered: false,
      isOnline: true,
    },
  ],
  rule: "CarteadoGameRules",
  createdAt: "2026-01-01T00:00:00.000Z",
  ownerId: "user-1",
};

const basePlayer = {
  socketId: "",
  status: PlayerStatus.PLAYING,
  table: [],
  hand: [],
  hasStarted: false,
  role: "user" as const,
};

const mockGame = {
  id: "game-1",
  status: GameStatus.PLAYING,
  playerTurn: "user-2",
  rulesName: "CarteadoGameRules",
  deck: { cards: [] },
  players: [
    {
      ...basePlayer,
      userId: "user-1",
      name: "Owner",
      hand: [{ toString: "AS" }, { toString: "2S" }],
    },
    {
      ...basePlayer,
      userId: "user-2",
      name: "Guest",
      hand: [{ toString: "3S" }],
    },
  ],
} as unknown as IGameState;

describe("RoomParticipantsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => useGameStore.setState({ game: null, userId: null }));
    (useRoomContext as jest.Mock).mockReturnValue({ room: mockRoom });
    (useSocket as jest.Mock).mockReturnValue({
      socket: { emit: mockEmit },
      isConnected: true,
    });
  });

  it("renders real participant data in the lobby", () => {
    render(<RoomParticipantsPanel />);

    expect(
      screen.getByTestId(testIds.room.participantsPanel)
    ).toBeInTheDocument();
    expect(screen.getByText("2/4")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Guest")).toBeInTheDocument();
    expect(screen.getByLabelText("RoomInfo.owner")).toBeInTheDocument();
    expect(screen.getByText("Participants.guest")).toBeInTheDocument();
    expect(screen.getByText("Participants.badge.ready")).toBeInTheDocument();
    expect(screen.getByText("Participants.badge.waiting")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Participants.cards/)).toBeNull();
  });

  it("shows hand count and turn from the game state", () => {
    act(() => useGameStore.setState({ game: mockGame, userId: "user-2" }));

    render(<RoomParticipantsPanel />);

    expect(screen.getAllByLabelText("Participants.cards")).toHaveLength(2);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(
      screen.getByText("Participants.status.yourTurn")
    ).toBeInTheDocument();
    expect(screen.getByText("Participants.badge.playing")).toBeInTheDocument();
  });

  it("leaves room when navigating back", async () => {
    const user = userEvent.setup();
    render(<RoomParticipantsPanel />);

    await user.click(screen.getByTestId(testIds.room.backButton));

    expect(mockEmit).toHaveBeenCalledWith("quit", { roomHash: mockRoom.hash });
    expect(mockPush).toHaveBeenCalledWith("/menu");
  });
});
