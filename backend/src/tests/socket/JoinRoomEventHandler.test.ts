import { socketTestSetup } from "./socket.setup";
import { getRoomState } from "@/lib/redis/room";
import { getGameState } from "@/lib/redis/game";
import { closeSockets, createTestSocket } from "./utils";

jest.mock("@/lib/redis/game", () => ({
  getGameState: jest.fn(),
}));

const mockRoomState = { participants: [] as object[] };
jest.mock("@/lib/redis/room", () => ({
  getRoomState: jest.fn().mockResolvedValue({
    hash: "room-test",
    status: "open",
    size: 2,
    spectators: [],
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
          participants: [...mockRoomState.participants],
        };
        const result = updateFn(baseRoom as any);
        if (result && "participants" in result) {
          mockRoomState.participants = [...(result as any).participants];
        }
        return result;
      }
    ),
}));

describe("JoinRoomEventHandler - integration", () => {
  const { getPort } = socketTestSetup();

  beforeEach(() => {
    mockRoomState.participants = [];
  });

  it("user should be able to join room", (done) => {
    const port = getPort();
    const socket = createTestSocket("valid-token", port);

    socket.on("room_updated", (room) => {
      try {
        const players = room.players ?? room.participants ?? [];
        expect(players.length).toBe(1);
        expect(players[0]).toMatchObject({
          userId: "valid-token",
          name: "valid-token",
        });
        done();
      } catch (err) {
        done(err);
      } finally {
        socket.close();
      }
    });
    socket.on("connect", () => {
      socket.emit("join_room", { roomHash: "room-test" });
    });
  });
  it("should return error if room is full", (done) => {
    const port = getPort();
    const socketA = createTestSocket("userA-valid-token", port);
    const socketB = createTestSocket("userB-valid-token", port);
    const socketC = createTestSocket("userC-valid-token", port);

    socketA.on("connect", () => {
      socketA.emit("join_room", { roomHash: "room-test" });
    });
    socketB.on("connect", () => {
      socketB.emit("join_room", { roomHash: "room-test" });
    });
    socketC.on("connect", () => {
      socketC.emit("join_room", { roomHash: "room-test" });
    });
    socketC.on("error", (error) => {
      try {
        expect(error).toBe("ROOM_IS_FULL");
        done();
      } catch (err) {
        done(err);
      } finally {
        closeSockets(socketA, socketB, socketC);
      }
    });
  });
  it.skip("should return error if room does not exist", (done) => {
    (getRoomState as jest.Mock).mockResolvedValue(null);
    const port = getPort();
    const socket = createTestSocket("userA-valid-token", port);

    socket.on("connect", () => {
      socket.emit("join_room", { roomHash: "room-test" });
    });
    socket.on("error", (error) => {
      expect(error).toBe("ROOM_NOT_FOUND");
      done();
      closeSockets(socket);
    });
  });
  it.skip("should return same user to room if already in room", (done) => {
    (getRoomState as jest.Mock).mockResolvedValue({
      hash: "room-test",
      status: "playing",
      size: 2,
      spectators: [],
    });
    (getGameState as jest.Mock).mockResolvedValue({
      players: [
        {
          userId: "valid-token",
        },
      ],
    });
    const port = getPort();
    const socket = createTestSocket("valid-token", port);
    socket.on("info", (message) => {
      try {
        expect(message).toBe("WELCOME_BACK");
        done();
      } catch (err) {
        done(err);
      } finally {
        socket.close();
      }
    });
    socket.on("connect", () => {
      socket.emit("join_room", { roomHash: "room-test" });
    });
  });

  it.skip("should add user to spectators if room is playing", (done) => {
    (getRoomState as jest.Mock).mockResolvedValue({
      hash: "room-test",
      status: "playing",
      size: 2,
      spectators: [],
    });
    (getGameState as jest.Mock).mockResolvedValue({
      players: [],
    });
    const port = getPort();
    const socket = createTestSocket("valid-token", port);

    socket.on("room_updated", (room) => {
      try {
        expect(room.spectators.length).toBe(1);
        expect(room.spectators).toContainEqual({
          id: "valid-token",
          name: "valid-token",
          email: "valid-token@test.com",
          room: "room-test",
          role: "user",
        });
        done();
      } catch (err) {
        done(err);
      } finally {
        socket.close();
      }
    });
    socket.on("connect", () => {
      socket.emit("join_room", { roomHash: "room-test" });
    });
  });
});
