import { PlayerStatus } from "shared/game";
import prisma from "@/prisma";
import { getGuest } from "@/lib/redis/guests";
import { getRoomState } from "@/lib/redis/room";
import { CHANNEL } from "@/socket/channels";
import {
  authenticateGuest,
  createRoomViaApi,
} from "@/tests/integration/helpers/auth";
import { resetIntegrationState } from "@/tests/integration/helpers/resetState";
import {
  createIntegrationTestServer,
  type IntegrationTestServer,
} from "@/tests/integration/helpers/testServer";
import {
  closeSockets,
  createTestSocket,
  waitForEvent,
} from "@/tests/socket/utils";

describe("Guest room lobby (integration)", () => {
  let server: IntegrationTestServer;

  beforeAll(async () => {
    server = await createIntegrationTestServer();
  }, 60_000);

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await resetIntegrationState();
  });

  it("authenticates guest, persists room in Mongo/Redis, joins lobby and marks ready", async () => {
    const guest = await authenticateGuest(server.httpServer, "lobby-guest");

    const guestInRedis = await getGuest(guest.id);
    expect(guestInRedis.name).toBe("lobby-guest");

    const room = await createRoomViaApi(server.httpServer, guest.accessToken, {
      name: "Integration Sala",
      size: 2,
      rule: "CarteadoGameRules",
    });

    const dbRoom = await prisma.room.findFirst({ where: { hash: room.hash } });
    expect(dbRoom).not.toBeNull();
    expect(dbRoom?.name).toBe("Integration Sala");
    expect(dbRoom?.size).toBe(2);

    const dbChat = await prisma.chat.findUnique({
      where: { id: dbRoom!.chatId },
    });
    expect(dbChat).not.toBeNull();

    const cachedRoom = await getRoomState(room.hash);
    expect(cachedRoom).not.toBeNull();
    expect(cachedRoom?.name).toBe("Integration Sala");
    expect(cachedRoom?.participants).toHaveLength(0);

    const socket = createTestSocket(guest.accessToken, server.port);

    const roomJoined = waitForEvent<{
      room: { participants: { userId: string; status: string }[] };
    }>(socket, CHANNEL.SERVER.ROOM_JOINED);

    await new Promise<void>((resolve, reject) => {
      socket.on("connect", () => {
        socket.emit("join_room", { roomHash: room.hash });
        resolve();
      });
      socket.on("connect_error", reject);
    });

    const joinedPayload = await roomJoined;
    expect(joinedPayload.room.participants).toHaveLength(1);
    expect(joinedPayload.room.participants[0]).toMatchObject({
      userId: guest.id,
      name: guest.name,
      status: PlayerStatus.NOT_READY,
    });

    const roomAfterJoin = await getRoomState(room.hash);
    expect(roomAfterJoin?.participants).toHaveLength(1);

    const roomUpdated = waitForEvent<{
      participants: { userId: string; status: string }[];
    }>(socket, CHANNEL.SERVER.ROOM_UPDATED);

    socket.emit("set_player_status", { status: PlayerStatus.READY });

    const updatedRoom = await roomUpdated;
    expect(updatedRoom.participants[0]?.status).toBe(PlayerStatus.READY);

    const roomAfterReady = await getRoomState(room.hash);
    expect(roomAfterReady?.participants[0]?.status).toBe(PlayerStatus.READY);

    closeSockets(socket);
  });
});
