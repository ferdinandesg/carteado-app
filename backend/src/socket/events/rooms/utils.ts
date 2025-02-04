import { RoomUsers } from "@socket/utils/getRoomPlayers";
import { PopulatedPlayer } from "src/game/game";
import prisma from "src/prisma";

export async function persistAuthUsers(authUsers: RoomUsers[], roomId: string) {
  if (authUsers.length === 0) return;

  await prisma.player.createMany({
    data: authUsers.map((user) => ({
      roomId,
      status: "chosing",
      userId: user.id,
    })),
  });
}

export async function fetchDbPlayers(roomId: string) {
  return prisma.player.findMany({
    where: { roomId },
    include: { user: true },
  });
}

export function buildGuestPlayers(
  guests: RoomUsers[],
  roomId: string
): PopulatedPlayer[] {
  return guests.map((guest) => ({
    roomId,
    status: "chosing",
    userId: guest.id,
    user: {
      id: guest.id,
      name: guest.name,
      email: guest.email,
      image: guest.image,
    },
  })) as PopulatedPlayer[];
}

export function mergeDbPlayersAndGuests(
  dbPlayers: PopulatedPlayer[],
  guestPlayers: PopulatedPlayer[]
): PopulatedPlayer[] {
  return [...dbPlayers, ...guestPlayers];
}

export async function createPlayers(
  users: RoomUsers[],
  roomId: string
): Promise<PopulatedPlayer[]> {
  const authUsers = users.filter((u) => u.role === "user");
  const guests = users.filter((u) => u.role === "guest");
  await persistAuthUsers(authUsers, roomId);
  const dbPlayers = await fetchDbPlayers(roomId);
  const guestPlayers = buildGuestPlayers(guests, roomId);

  return mergeDbPlayersAndGuests(dbPlayers, guestPlayers);
}
