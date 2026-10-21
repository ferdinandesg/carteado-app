import type { Socket } from "socket.io-client";
import { GameStatus, PlayerStatus, type BasePlayer } from "shared/game";
import prisma from "@/prisma";
import { getGameState } from "@/lib/redis/game";
import { CHANNEL } from "@/socket/channels";
import { TrucoGame } from "@/game/TrucoGameRules";
import {
  askTruco,
  createGameFromRuleName,
  rejectTruco,
  saveGameInstance,
} from "@/services/game.service";
import { GOLD_PER_LOSS, GOLD_PER_WIN } from "@/services/rewards.service";
import {
  authenticateGuest,
  createRoomViaApi,
  type GuestAuthResult,
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

type WireGame = {
  status: string;
  playerTurn: string;
  trucoState?: string;
  trucoAskerId?: string;
  teams: { id: string; userIds: string[]; score: number }[];
};

async function connectAndJoin(
  guest: GuestAuthResult,
  port: number,
  roomHash: string
): Promise<Socket> {
  const socket = createTestSocket(guest.accessToken, port);
  await waitForEvent(socket, "connect");
  socket.emit(CHANNEL.CLIENT.JOIN_ROOM, { roomHash });
  await waitForEvent(socket, CHANNEL.SERVER.ROOM_JOINED);
  return socket;
}

/** Espera o próximo `game_updated` que satisfaça `predicate` (broadcasts antigos são ignorados). */
function waitForGame(
  socket: Socket,
  predicate: (game: WireGame) => boolean
): Promise<WireGame> {
  return new Promise((resolve) => {
    const onUpdate = (game: WireGame) => {
      if (!predicate(game)) return;
      socket.off(CHANNEL.SERVER.GAME_UPDATED, onUpdate);
      resolve(game);
    };
    socket.on(CHANNEL.SERVER.GAME_UPDATED, onUpdate);
  });
}

/** `room_updated` também chega por ações de outros jogadores; espera o próprio READY. */
async function setReady(socket: Socket, userId: string) {
  const updated = new Promise<void>((resolve) => {
    const onUpdate = (room: {
      participants: { userId: string; status: string }[];
    }) => {
      const me = room.participants.find((p) => p.userId === userId);
      if (me?.status !== PlayerStatus.READY) return;
      socket.off(CHANNEL.SERVER.ROOM_UPDATED, onUpdate);
      resolve();
    };
    socket.on(CHANNEL.SERVER.ROOM_UPDATED, onUpdate);
  });
  socket.emit(CHANNEL.CLIENT.SET_PLAYER_STATUS, {
    status: PlayerStatus.READY,
  });
  await updated;
}

describe("Truco match (integration)", () => {
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

  it("only the defending team can run from truco over the socket", async () => {
    const owner = await authenticateGuest(server.httpServer, "truco-owner");
    const rival = await authenticateGuest(server.httpServer, "truco-rival");
    const room = await createRoomViaApi(server.httpServer, owner.accessToken, {
      name: "Integration Truco",
      size: 2,
      rule: "TrucoGameRules",
    });

    const ownerSocket = await connectAndJoin(owner, server.port, room.hash);
    const rivalSocket = await connectAndJoin(rival, server.port, room.hash);
    const sockets: Record<string, Socket> = {
      [owner.id]: ownerSocket,
      [rival.id]: rivalSocket,
    };

    try {
      await setReady(ownerSocket, owner.id);
      await setReady(rivalSocket, rival.id);

      const isPlaying = (g: WireGame) => g.status === GameStatus.PLAYING;
      const started = Promise.all([
        waitForGame(ownerSocket, isPlaying),
        waitForGame(rivalSocket, isPlaying),
      ]);
      ownerSocket.emit(CHANNEL.CLIENT.START_GAME);
      const [game] = await started;

      const askerId = game.playerTurn;
      const defenderId = askerId === owner.id ? rival.id : owner.id;
      const asker = sockets[askerId];
      const defender = sockets[defenderId];

      const asked = waitForGame(defender, (g) => g.trucoState === "PENDING");
      asker.emit(CHANNEL.CLIENT.ASK_TRUCO);
      expect((await asked).trucoAskerId).toBe(askerId);

      // O próprio pedinte tenta correr: bloqueado na Fase 0.
      const askerError = new Promise<unknown>((resolve) =>
        asker.once("error", resolve)
      );
      asker.emit(CHANNEL.CLIENT.REJECT_TRUCO);
      expect(await askerError).toBe("Invalid action");

      const afterBlocked = (await getGameState(room.hash)) as WireGame;
      expect(afterBlocked.trucoState).toBe("PENDING");
      expect(afterBlocked.teams.every((team) => team.score === 0)).toBe(true);

      const rejected = waitForGame(asker, (g) =>
        g.teams.some((team) => team.score > 0)
      );
      defender.emit(CHANNEL.CLIENT.REJECT_TRUCO);
      const afterReject = await rejected;

      const askerTeam = afterReject.teams.find((team) =>
        team.userIds.includes(askerId)
      );
      const defenderTeam = afterReject.teams.find((team) =>
        team.userIds.includes(defenderId)
      );
      expect(askerTeam?.score).toBe(1);
      expect(defenderTeam?.score).toBe(0);
    } finally {
      closeSockets(ownerSocket, rivalSocket);
    }
  });

  it("applies end-of-match rewards exactly once", async () => {
    const owner = await authenticateGuest(server.httpServer, "rewards-owner");
    const room = await createRoomViaApi(server.httpServer, owner.accessToken, {
      name: "Integration Rewards",
      size: 2,
      rule: "TrucoGameRules",
    });

    const [winner, loser] = await Promise.all(
      ["winner", "loser"].map((name) =>
        prisma.user.create({
          data: { name, email: `${name}@test.com`, image: "", rank: 100 },
        })
      )
    );
    const players = [winner, loser].map(
      (user) =>
        ({
          userId: user.id,
          name: user.name,
          hand: [],
          playedCards: [],
          status: PlayerStatus.PLAYING,
        }) as unknown as BasePlayer
    );

    const game = (await createGameFromRuleName(
      "TrucoGameRules",
      players
    )) as TrucoGame;
    game.startGame();
    const winnerTeam = game.teams.find((team) =>
      team.userIds.includes(winner.id)
    )!;
    winnerTeam.score = 11;
    game.playerTurn = winner.id;
    await saveGameInstance(room.hash, game);

    await askTruco(room.hash, winner.id);
    // Duas fugas concorrentes: o lock serializa; a segunda já encontra a partida premiada.
    await Promise.allSettled([
      rejectTruco(room.hash, loser.id),
      rejectTruco(room.hash, loser.id),
    ]);

    const saved = await getGameState(room.hash);
    expect(saved.status).toBe(GameStatus.FINISHED);
    expect(saved.rewardsApplied).toBe(true);

    const [winnerAfter, loserAfter] = await Promise.all(
      [winner, loser].map((user) =>
        prisma.user.findUniqueOrThrow({ where: { id: user.id } })
      )
    );
    expect(winnerAfter.cash).toBe(GOLD_PER_WIN);
    expect(loserAfter.cash).toBe(GOLD_PER_LOSS);
    expect(winnerAfter.rank).toBe(120);
    expect(loserAfter.rank).toBe(120);

    const dbRoom = await prisma.room.findFirst({ where: { hash: room.hash } });
    expect(dbRoom?.status).toBe("finished");
  });
});
