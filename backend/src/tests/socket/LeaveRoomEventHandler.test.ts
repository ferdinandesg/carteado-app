// Ciclo de vida da sala via socket: sair (quit) e voltar, transferência de
// dono e limpeza do socket ao trocar de sala.

import { Socket } from "socket.io-client";
import { socketTestSetup } from "./socket.setup";
import { closeSockets, createTestSocket, waitForEvent } from "./utils";

const USER_A = "userA-valid-token";
const USER_B = "userB-valid-token";
const ROOM = "room-test";

type MockRoom = {
  hash: string;
  status: string;
  size: number;
  ownerId: string | null;
  participants: {
    userId: string;
    isOnline: boolean;
    isRegistered: boolean;
    status: string;
  }[];
};

const mockRoomState: { room: MockRoom | null } = { room: null };

jest.mock("@/lib/redis/room", () => ({
  getRoomState: jest.fn(async () => mockRoomState.room),
  saveRoomState: jest.fn(),
  atomicallyUpdateRoomState: jest.fn(
    async (_hash: string, updateFn: (room: unknown) => MockRoom | null) => {
      if (!mockRoomState.room) return null;
      const result = updateFn(mockRoomState.room);
      if (result) mockRoomState.room = result;
      return mockRoomState.room;
    }
  ),
}));

jest.mock("@/lib/redis/game", () => ({
  getGameState: jest.fn(async () => ({
    rulesName: "TrucoGameRules",
    players: [USER_A, USER_B].map((userId) => ({
      userId,
      name: userId,
      status: "waiting",
      hand: [],
      table: [],
      playedCards: [],
      teamId: "",
    })),
    bunch: [],
    status: "playing",
    playerTurn: USER_A,
    deck: "[]",
    vira: null,
    manilha: "",
    currentBet: 1,
    trucoState: "NONE",
    trucoAskerId: null,
    rounds: 1,
    teams: [],
    handsResults: [],
  })),
  saveGameState: jest.fn(),
}));

describe("LeaveRoomEventHandler - integration", () => {
  const { getPort } = socketTestSetup();
  let socketA: Socket;
  let socketB: Socket;

  const freshRoom = (status: string): MockRoom => ({
    hash: ROOM,
    status,
    size: 2,
    ownerId: USER_A,
    participants: [],
  });

  const connectAndJoin = async (token: string) => {
    const socket = createTestSocket(token, getPort());
    await waitForEvent<void>(socket, "connect");
    const joined = waitForEvent(socket, "room_joined");
    socket.emit("join_room", { roomHash: ROOM });
    await joined;
    return socket;
  };

  afterEach(() => {
    closeSockets(socketA, socketB);
  });

  it("removes the participant and transfers ownership when the room is open", async () => {
    mockRoomState.room = freshRoom("open");
    socketA = await connectAndJoin(USER_A);
    socketB = await connectAndJoin(USER_B);

    const updated = waitForEvent<MockRoom>(socketB, "room_updated");
    socketA.emit("quit", { roomHash: ROOM });
    const room = await updated;

    expect(room.participants.map((p) => p.userId)).toEqual([USER_B]);
    expect(room.ownerId).toBe(USER_B);
  });

  it("keeps the seat (offline) while playing so the player can rejoin", async () => {
    mockRoomState.room = freshRoom("open");
    socketA = await connectAndJoin(USER_A);
    socketB = await connectAndJoin(USER_B);
    mockRoomState.room!.status = "playing";

    const updated = waitForEvent<MockRoom>(socketB, "room_updated");
    socketA.emit("quit", { roomHash: ROOM });
    const room = await updated;

    const seatA = room.participants.find((p) => p.userId === USER_A);
    expect(seatA).toBeDefined();
    expect(seatA!.isOnline).toBe(false);

    // Voltar para a sala em jogo não deve dar ROOM_IS_PLAYING.
    const rejoined = waitForEvent<{ room: MockRoom }>(socketA, "room_joined");
    const gameSent = waitForEvent(socketA, "game_updated");
    socketA.emit("join_room", { roomHash: ROOM });
    const { room: afterRejoin } = await rejoined;
    await gameSent;

    expect(
      afterRejoin.participants.find((p) => p.userId === USER_A)!.isOnline
    ).toBe(true);
  });

  it("stops receiving room broadcasts after leaving", async () => {
    mockRoomState.room = freshRoom("open");
    socketA = await connectAndJoin(USER_A);
    socketB = await connectAndJoin(USER_B);

    const leftAck = waitForEvent(socketB, "room_updated");
    socketA.emit("quit", { roomHash: ROOM });
    await leftAck;

    let received = false;
    socketA.on("room_updated", () => (received = true));
    const statusAck = waitForEvent(socketB, "room_updated");
    socketB.emit("set_player_status", { status: "ready" });
    await statusAck;
    await new Promise((r) => setTimeout(r, 200));

    expect(received).toBe(false);
  });

  it("rejects unsupported statuses in set_player_status", async () => {
    mockRoomState.room = freshRoom("open");
    socketA = await connectAndJoin(USER_A);
    socketB = await connectAndJoin(USER_B);

    const error = waitForEvent<string>(socketA, "error").catch((e) => e);
    socketA.emit("set_player_status", { status: "playing" });
    expect(await error).toBe("INVALID_PAYLOAD");
  });
});
