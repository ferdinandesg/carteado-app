import { CarteadoGame } from "@/game/CarteadoGameRules";
import { getRoomState } from "@/lib/redis/room";
import { socketTestSetup } from "./socket.setup";
import { closeSockets, createTestSocket, waitForEvent } from "./utils";

const OWNER_ID = "userA-valid-token";
const GUEST_ID = "userB-valid-token";

const participant = (userId: string, status: string) => ({
  userId,
  name: userId,
  status,
  isOnline: true,
});

const roomWith = (participants: object[]) => ({
  id: "room-db-id",
  hash: "room-test",
  status: "open",
  rule: "CarteadoGameRules",
  size: 2,
  ownerId: OWNER_ID,
  spectators: [],
  participants,
});

jest.mock("@/lib/redis/room", () => ({
  getRoomState: jest.fn(),
  saveRoomState: jest.fn(),
  atomicallyUpdateRoomState: jest
    .fn()
    .mockImplementation(
      async (roomHash: string, updateFn: (r: object) => object | null) =>
        updateFn({
          hash: roomHash,
          status: "open",
          size: 2,
          spectators: [],
          participants: [],
        })
    ),
}));

jest.mock("@/lib/redis/game", () => ({
  getGameState: jest.fn(),
  saveGameState: jest.fn(),
}));

jest.mock("@/prisma", () => ({
  __esModule: true,
  default: { room: { update: jest.fn().mockResolvedValue({}) } },
}));

jest.mock("@/socket/events/rooms/utils", () => ({
  createPlayers: jest.fn().mockResolvedValue([
    {
      roomId: "room-test",
      status: "choosing",
      userId: "userA-valid-token",
      user: { id: "userA-valid-token", name: "userA-valid-token", email: "" },
    },
    {
      roomId: "room-test",
      status: "choosing",
      userId: "userB-valid-token",
      user: { id: "userB-valid-token", name: "userB-valid-token", email: "" },
    },
  ]),
}));

const assertGame = (game: CarteadoGame) => {
  expect(game.status).toBe("playing");
  expect(game.players).toHaveLength(2);
  expect(game.players[0].status).toBe("choosing");
  expect(game.players[1].status).toBe("choosing");
  expect(game.players[0].hand).toHaveLength(9);
  expect(game.players[1].hand).toHaveLength(9);
};

describe("StartGameEventHandler - integration", () => {
  const { getPort } = socketTestSetup();

  async function ownerInRoom() {
    const socket = createTestSocket(OWNER_ID, getPort());
    await waitForEvent(socket, "connect");
    socket.emit("join_room", { roomHash: "room-test" });
    await waitForEvent(socket, "room_joined");
    return socket;
  }

  it("should not start if the room is not full", async () => {
    (getRoomState as jest.Mock).mockResolvedValueOnce(
      roomWith([participant(OWNER_ID, "ready")])
    );
    const socket = await ownerInRoom();

    const error = await new Promise<unknown>((resolve) => {
      socket.on("error", resolve);
      socket.emit("start_game");
    });
    closeSockets(socket);

    expect(error).toBe("ROOM_IS_NOT_FULL");
  });

  it("should not start if the room is not ready", async () => {
    (getRoomState as jest.Mock).mockResolvedValueOnce(
      roomWith([
        participant(OWNER_ID, "ready"),
        participant(GUEST_ID, "not_ready"),
      ])
    );
    const socket = await ownerInRoom();

    const error = await new Promise<unknown>((resolve) => {
      socket.on("error", resolve);
      socket.emit("start_game");
    });
    closeSockets(socket);

    expect(error).toBe("NOT_ALL_PLAYERS_ARE_READY");
  });

  it("should start the game if room is valid", async () => {
    (getRoomState as jest.Mock).mockResolvedValueOnce(
      roomWith([participant(OWNER_ID, "ready"), participant(GUEST_ID, "ready")])
    );
    const socket = await ownerInRoom();

    socket.emit("start_game");
    const game = await waitForEvent<CarteadoGame>(socket, "game_updated");
    closeSockets(socket);

    assertGame(game);
  });
});
