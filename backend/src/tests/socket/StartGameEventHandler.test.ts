import { CarteadoGame } from "src/game/CarteadoGameRules";
import { socketTestSetup } from "./socket.setup";
import { closeSockets, createTestSocket, waitForEvent } from "./utils";

const startGameMockRoomState = { participants: [] as object[] };
jest.mock("@/lib/redis/room", () => ({
  getRoomState: jest.fn().mockResolvedValue({
    hash: "room-test",
    status: "open",
    size: 2,
    spectators: [],
    ownerId: "userA-valid-token",
    participants: [],
  }),
  saveRoomState: jest.fn(),
  atomicallyUpdateRoomState: jest
    .fn()
    .mockImplementation(
      async (roomHash: string, updateFn: (r: object) => object | null) => {
        const baseRoom = {
          hash: roomHash,
          status: "open",
          size: 2,
          spectators: [] as object[],
          participants: [...startGameMockRoomState.participants],
        };
        const result = updateFn(baseRoom as any);
        if (result && "participants" in result) {
          startGameMockRoomState.participants = [
            ...(result as any).participants,
          ];
        }
        return result;
      }
    ),
}));

jest.mock("@/lib/redis/game", () => ({
  getGameState: jest.fn(),
  saveGameState: jest.fn(),
}));

jest.mock("@/prisma", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("@/socket/events/rooms/utils", () => ({
  createPlayers: jest.fn().mockResolvedValue([
    {
      roomId: "room-test",
      status: "choosing",
      userId: "userA-valid-token",
      user: {
        id: "userA-valid-token",
        name: "userA-valid-token",
        email: "",
      },
    },
    {
      roomId: "room-test",
      status: "choosing",
      userId: "userA-valid-token",
      user: {
        id: "userB-valid-token",
        name: "userB-valid-token",
        email: "",
      },
    },
  ]),
}));

const assertGame = (game: CarteadoGame) => {
  expect(game.status).toBe("playing");
  expect(game.players).toHaveLength(2);
  expect(game.players[0].status).toBe("choosing");
  expect(game.players[1].status).toBe("choosing");
  expect(game.players[0].hand).toHaveLength(9);
  expect(game.players[0].hand).toHaveLength(9);
  expect(game.players[1].hand).toHaveLength(9);
};

describe("StartGameEventHandler - integration", () => {
  const { getPort } = socketTestSetup();

  beforeEach(() => {
    startGameMockRoomState.participants = [];
  });

  it("should not start if the room is not full", async () => {
    const port = getPort();
    const socketA = createTestSocket("userA-valid-token", port);
    await waitForEvent<void>(socketA, "connect");
    socketA.emit("join_room", { roomHash: "room-test" });
    socketA.emit("set_player_status", { status: "READY" });
    await new Promise((r) => setTimeout(r, 1000));
    socketA.emit("start_game");
    socketA.on("error", (message) => {
      expect(message).toBe("ROOM_NOT_FULL");
    });
    closeSockets(socketA);
  });

  it("should not start if the room is not ready", async () => {
    const port = getPort();
    const socketA = createTestSocket("userA-valid-token", port);
    const socketB = createTestSocket("userB-valid-token", port);
    await waitForEvent<void>(socketA, "connect");
    await waitForEvent<void>(socketB, "connect");
    socketA.emit("join_room", { roomHash: "room-test" });
    socketB.emit("join_room", { roomHash: "room-test" });
    socketA.emit("set_player_status", { status: "READY" });
    await new Promise((r) => setTimeout(r, 1000));
    socketA.emit("start_game");
    socketA.on("error", (message) => {
      expect(message).toBe("PLAYERS_NOT_READY");
    });
    closeSockets(socketA, socketB);
  });

  it.skip("should start the game if room is valid", async () => {
    const port = getPort();
    const socketA = createTestSocket("userA-valid-token", port);
    const socketB = createTestSocket("userB-valid-token", port);

    await waitForEvent<void>(socketA, "connect");
    await waitForEvent<void>(socketB, "connect");

    socketA.emit("join_room", { roomHash: "room-test" });
    await waitForEvent<void>(socketA, "room_update");

    socketA.emit("set_player_status", { status: "READY" });
    await waitForEvent<void>(socketA, "room_update");

    socketB.emit("join_room", { roomHash: "room-test" });
    await waitForEvent<void>(socketB, "room_update");

    socketB.emit("set_player_status", { status: "READY" });
    await waitForEvent<void>(socketB, "room_update");

    socketA.emit("start_game");
    const game = await waitForEvent(socketA, "game_update");
    assertGame(game as CarteadoGame);
    closeSockets(socketA, socketB);
  });
});
