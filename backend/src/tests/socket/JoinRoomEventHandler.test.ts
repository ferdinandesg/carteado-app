import { socketTestSetup } from "./socket.setup";
import { atomicallyUpdateRoomState } from "@/lib/redis/room";
import { closeSockets, createTestSocket, waitForEvent } from "./utils";

jest.mock("@/lib/redis/game", () => ({
  getGameState: jest.fn(),
}));

const mockRoomState = {
  status: "open",
  participants: [] as object[],
};
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
          status: mockRoomState.status,
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
    mockRoomState.status = "open";
    mockRoomState.participants = [];
  });

  it("user should be able to join room", async () => {
    const port = getPort();
    const socket = createTestSocket("valid-token", port);

    const room = await new Promise<any>((resolve) => {
      socket.on("room_updated", resolve);
      socket.on("connect", () => {
        socket.emit("join_room", { roomHash: "room-test" });
      });
    });
    closeSockets(socket);

    const players = room.players ?? room.participants ?? [];
    expect(players.length).toBe(1);
    expect(players[0]).toMatchObject({
      userId: "valid-token",
      name: "valid-token",
    });
  });

  it("should return error if room is full", async () => {
    const port = getPort();
    const socketA = createTestSocket("userA-valid-token", port);
    const socketB = createTestSocket("userB-valid-token", port);
    const socketC = createTestSocket("userC-valid-token", port);

    await Promise.all([
      waitForEvent(socketA, "connect"),
      waitForEvent(socketB, "connect"),
      waitForEvent(socketC, "connect"),
    ]);
    socketA.emit("join_room", { roomHash: "room-test" });
    await waitForEvent(socketA, "room_joined");
    socketB.emit("join_room", { roomHash: "room-test" });
    await waitForEvent(socketB, "room_joined");

    const error = await new Promise<unknown>((resolve) => {
      socketC.on("error", resolve);
      socketC.emit("join_room", { roomHash: "room-test" });
    });
    closeSockets(socketA, socketB, socketC);

    expect(error).toBe("ROOM_IS_FULL");
  });

  it("should return error if a new user joins a room that is playing", async () => {
    mockRoomState.status = "playing";
    const port = getPort();
    const socket = createTestSocket("valid-token", port);
    await waitForEvent(socket, "connect");

    const error = await new Promise<unknown>((resolve) => {
      socket.on("error", resolve);
      socket.emit("join_room", { roomHash: "room-test" });
    });
    closeSockets(socket);

    expect(error).toBe("ROOM_IS_PLAYING");
  });

  it("should put a returning participant back online without duplicating them", async () => {
    mockRoomState.participants = [
      {
        userId: "valid-token",
        name: "valid-token",
        status: "ready",
        isOnline: false,
      },
    ];
    const port = getPort();
    const socket = createTestSocket("valid-token", port);
    await waitForEvent(socket, "connect");

    socket.emit("join_room", { roomHash: "room-test" });
    const { room } = await waitForEvent<{ room: any }>(socket, "room_joined");
    closeSockets(socket);

    expect(atomicallyUpdateRoomState).toHaveBeenCalled();
    expect(room.participants).toHaveLength(1);
    expect(room.participants[0]).toMatchObject({
      userId: "valid-token",
      isOnline: true,
    });
  });
});
