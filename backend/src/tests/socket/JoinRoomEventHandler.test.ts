import { socketTestSetup } from "./socket.setup.test";
import { getRoomState } from "src/redis/room";
import { getGameState } from "src/redis/game";
import { createTestSocket } from "./utils";

jest.mock("src/redis/game", () => ({
  getGameState: jest.fn(),
}));

jest.mock("src/redis/room", () => ({
  getRoomState: jest.fn().mockResolvedValue({
    hash: "room-test",
    status: "open",
    size: 2,
    spectators: [],
  }),
  saveRoomState: jest.fn(),
}));

describe("JoinRoomEventHandler - integration", () => {
  socketTestSetup();

  it("user should be able to join room", (done) => {
    const socket = createTestSocket("valid-token");

    socket.on("room_update", (room) => {
      try {
        expect(room.players.length).toBe(1);
        expect(room.players).toContainEqual({
          id: "valid-token",
          name: "valid-token",
          status: "NOT_READY",
          room: "room-test",
          email: "valid-token@test.com",
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
    const socketA = createTestSocket("userA-valid-token");
    const socketB = createTestSocket("userB-valid-token");
    const socketC = createTestSocket("userC-valid-token");

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
        socketA.close();
        socketB.close();
        socketC.close();
      }
    });
  });
  it("should return error if room does not exist", (done) => {
    (getRoomState as jest.Mock).mockResolvedValue(null);
    const socket = createTestSocket("userA-valid-token");

    socket.on("connect", () => {
      socket.emit("join_room", { roomHash: "room-test" });
    });
    socket.on("error", (error) => {
      expect(error).toBe("ROOM_NOT_FOUND");
      done();
    });
  });
  it("should return same user to room if already in room", (done) => {
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
    const socket = createTestSocket("valid-token");
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

  it("should add user to spectators if room is playing", (done) => {
    (getRoomState as jest.Mock).mockResolvedValue({
      hash: "room-test",
      status: "playing",
      size: 2,
      spectators: [],
    });
    (getGameState as jest.Mock).mockResolvedValue({
      players: [],
    });
    const socket = createTestSocket("valid-token");

    socket.on("room_update", ({ room }) => {
      try {
        expect(room.spectators.length).toBe(1);
        expect(room.spectators).toContainEqual({
          id: "valid-token",
          name: "valid-token",
          email: "valid-token@test.com",
          room: "room-test",
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
