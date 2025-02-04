import GameClass from "src/game/game";
import { socketTestSetup } from "./socket.setup.test";
import { closeSockets, createTestSocket } from "./utils";
import { Socket } from "socket.io-client";
// import { getRoomState } from "src/redis/room";
// import { getGameState, saveGameState } from "src/redis/game";

jest.mock("src/redis/room", () => ({
  saveRoomState: jest.fn(),
}));

jest.mock("src/prisma", () => ({
  __esModule: true,
  default: require("../prisma.mock").default,
}));

jest.mock("@socket/events/rooms/utils", () => ({
  createPlayers: jest.fn().mockResolvedValue([
    {
      roomId: "room-test",
      status: "chosing",
      userId: "userA-valid-token",
      user: {
        id: "userA-valid-token",
        name: "userA-valid-token",
        email: "",
      },
    },
    {
      roomId: "room-test",
      status: "chosing",
      userId: "userA-valid-token",
      user: {
        id: "userB-valid-token",
        name: "userB-valid-token",
        email: "",
      },
    },
  ]),
}));

jest.mock("src/redis/game", () => ({
  getGameState: jest.fn(),
  saveGameState: jest.fn(),
}));
jest.mock("src/redis/room", () => ({
  getRoomState: jest.fn().mockResolvedValue({
    hash: "room-test",
    status: "open",
    size: 2,
    spectators: [],
    ownerId: "userA-valid-token",
  }),
  saveRoomState: jest.fn(),
}));

function waitForEvent<T>(socket: Socket, eventName: string): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.once(eventName, (data: T) => resolve(data));
    socket.once("error", (err) => reject(err));
  });
}

const assertGame = (game: GameClass) => {
  expect(game.status).toBe("playing");
  expect(game.players).toHaveLength(2);
  expect(game.players[0].status).toBe("chosing");
  expect(game.players[1].status).toBe("chosing");
  expect(game.players[0].hand).toHaveLength(9);
  expect(game.players[0].hand).toHaveLength(9);
  expect(game.players[1].hand).toHaveLength(9);
};

describe("StartGameEventHandler - integration", () => {
  socketTestSetup();

  it("should not start if the room is not full", async () => {
    const socketA = createTestSocket("userA-valid-token");
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
    const socketA = createTestSocket("userA-valid-token");
    const socketB = createTestSocket("userB-valid-token");
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

  it("should start the game if room is valid", async () => {
    const socketA = createTestSocket("userA-valid-token");
    const socketB = createTestSocket("userB-valid-token");

    await waitForEvent<void>(socketA, "connect");
    await waitForEvent<void>(socketB, "connect");

    socketA.emit("join_room", { roomHash: "room-test" });
    socketA.emit("set_player_status", { status: "READY" });

    socketB.emit("join_room", { roomHash: "room-test" });
    socketB.emit("set_player_status", { status: "READY" });

    // Wait the sockets to be ready
    await new Promise((r) => setTimeout(r, 1500));
    socketA.emit("start_game");
    const game = await waitForEvent(socketA, "game_update");
    assertGame(game as GameClass);
    closeSockets(socketA, socketB);
  });
});
