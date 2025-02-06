import { RoomUsers } from "@socket/utils/getRoomPlayers";
import { GamePlayer } from "src/game/game";
import prisma from "src/prisma";

export async function persistAuthUsers(authUsers: RoomUsers[], roomId: string) {
  if (authUsers.length === 0) return;

  await prisma.player.createMany({
    data: authUsers.map((user) => ({
      roomId,
      status: "choosing",
      userId: user.id,
    })),
  });
}

export async function fetchDbPlayers(roomId: string): Promise<GamePlayer[]> {
  return prisma.player.findMany({
    where: { roomId },
    include: { user: true },
  }) as unknown as GamePlayer[];
}

export function buildGuestPlayers(
  guests: RoomUsers[],
  roomId: string
): GamePlayer[] {
  return guests.map((guest) => ({
    roomId,
    status: "choosing",
    userId: guest.id,
    user: {
      id: guest.id,
      name: guest.name,
      email: guest.email,
      image: guest.image,
    },
  })) as unknown as GamePlayer[];
}

export function mergeDbPlayersAndGuests(
  dbPlayers: GamePlayer[],
  guestPlayers: GamePlayer[]
): GamePlayer[] {
  return [...dbPlayers, ...guestPlayers];
}

export async function createPlayers(
  users: RoomUsers[],
  roomId: string
): Promise<GamePlayer[]> {
  const authUsers = users.filter((u) => u.role === "user");
  const guests = users.filter((u) => u.role === "guest");
  await persistAuthUsers(authUsers, roomId);
  const dbPlayers = await fetchDbPlayers(roomId);
  const guestPlayers = buildGuestPlayers(guests, roomId);

  return mergeDbPlayersAndGuests(dbPlayers, guestPlayers);
}
