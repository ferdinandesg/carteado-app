import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { PlayerStatus } from "shared/game";

import Chat from "@/components/Chat";
import Lobby from "@/components/Lobby";
import RoomInfo from "@/components/Players/roomInfo";
import RoomShell from "@/components/room/RoomShell";
import { useRoomContext } from "@/contexts/room.context";
import { useSocket } from "@/contexts/socket.context";
import { RoomInterface } from "@/models/room";

import RoomPage from "./page";

const mockSocket = {
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
};

const mockRoom: RoomInterface = {
  id: "room-id",
  hash: "abcd",
  name: "Sala Teste",
  status: "open",
  size: 2,
  participants: [
    {
      userId: "user-1",
      socketId: "socket-1",
      name: "Owner",
      status: PlayerStatus.READY,
      isRegistered: true,
      isOnline: true,
    },
  ],
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

jest.mock("@/components/buttons/withSound", () => ({
  withSound: (Component: unknown) => Component,
}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock("@/contexts/socket.context", () => ({
  useSocket: jest.fn(),
}));

jest.mock("@/contexts/room.context", () => ({
  useRoomContext: jest.fn(),
}));

jest.mock(
  "@/components/Game/game",
  () =>
    function Game() {
      return <div>game-screen</div>;
    }
);

describe("Room shell migration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSocket as jest.Mock).mockReturnValue({ socket: mockSocket });
    (useRoomContext as jest.Mock).mockReturnValue({
      room: mockRoom,
      isLoading: false,
    });
    (useParams as jest.Mock).mockReturnValue({ id: mockRoom.hash });
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "user-1", name: "Owner" } },
      status: "authenticated",
    });
  });

  it("renders the shell with participants, center content and room info", () => {
    render(
      <RoomShell
        participants={<aside>participants</aside>}
        info={<aside>info</aside>}>
        <section>center</section>
      </RoomShell>
    );

    expect(screen.getByText("participants")).toBeInTheDocument();
    expect(screen.getByText("center")).toBeInTheDocument();
    expect(screen.getByText("info")).toBeInTheDocument();
  });

  it("joins and leaves the socket room using the backend event contract", () => {
    const { unmount } = render(<RoomPage />);

    expect(mockSocket.emit).toHaveBeenCalledWith("join_room", {
      roomHash: mockRoom.hash,
    });

    unmount();

    expect(mockSocket.emit).toHaveBeenCalledWith("quit", {
      roomHash: mockRoom.hash,
    });
  });
});

describe("Chat migration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSocket as jest.Mock).mockReturnValue({ socket: mockSocket });
  });

  it("submits messages and unregisters only its own socket handlers", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Chat roomHash={mockRoom.hash} />);

    await user.type(screen.getByPlaceholderText("chatPlaceholder"), "ola");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(mockSocket.emit).toHaveBeenCalledWith("join_chat", {
      roomHash: mockRoom.hash,
    });
    expect(mockSocket.emit).toHaveBeenCalledWith("send_message", {
      roomHash: mockRoom.hash,
      message: "ola",
    });

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith(
      "join_chat",
      expect.any(Function)
    );
    expect(mockSocket.off).toHaveBeenCalledWith(
      "receive_message",
      expect.any(Function)
    );
    expect(mockSocket.off).toHaveBeenCalledWith(
      "load_messages",
      expect.any(Function)
    );
  });
});

describe("RoomInfo migration", () => {
  it("renders room details as organized information", () => {
    render(<RoomInfo room={mockRoom} />);

    expect(screen.getByText("RoomInfo.title")).toBeInTheDocument();
    expect(screen.getByText("abcd")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("RoomItem.CarteadoGameRules")).toBeInTheDocument();
  });
});

describe("Lobby migration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSocket as jest.Mock).mockReturnValue({ socket: mockSocket });
    (useRoomContext as jest.Mock).mockReturnValue({
      room: mockRoom,
      isLoading: false,
    });
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "user-1", name: "Owner" } },
      status: "authenticated",
    });
  });

  it("emits ready status and starts the game without payload", async () => {
    const user = userEvent.setup();
    render(<Lobby />);

    await user.click(screen.getByRole("button", { name: /Lobby.imReady/i }));
    await user.click(screen.getByRole("button", { name: /Lobby.startGame/i }));

    expect(mockSocket.emit).toHaveBeenCalledWith("set_player_status", {
      status: PlayerStatus.READY,
    });
    expect(mockSocket.emit).toHaveBeenCalledWith("start_game");
  });
});
