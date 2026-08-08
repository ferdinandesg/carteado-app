import prisma from "@/prisma";
import { FriendshipStatus } from "@prisma/client";

// Campos públicos de usuário expostos na friendlist
const FRIEND_USER_SELECT = {
  id: true,
  name: true,
  image: true,
  rank: true,
} as const;

export async function sendFriendRequest(
  requesterId: string,
  addresseeId: string
) {
  if (requesterId === addresseeId) throw "CANNOT_FRIEND_YOURSELF";

  const addressee = await prisma.user.findUnique({
    where: { id: addresseeId },
  });
  if (!addressee) throw "USER_NOT_FOUND";

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    },
  });

  if (existing) {
    if (existing.status === FriendshipStatus.ACCEPTED) throw "ALREADY_FRIENDS";
    if (existing.status === FriendshipStatus.BLOCKED)
      throw "REQUEST_NOT_ALLOWED";
    throw "REQUEST_ALREADY_EXISTS";
  }

  return prisma.friendship.create({
    data: { requesterId, addresseeId },
    include: { addressee: { select: FRIEND_USER_SELECT } },
  });
}

export async function acceptFriendRequest(
  userId: string,
  friendshipId: string
) {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });
  if (!friendship) throw "REQUEST_NOT_FOUND";
  if (friendship.addresseeId !== userId) throw "NOT_ALLOWED";
  if (friendship.status !== FriendshipStatus.PENDING)
    throw "REQUEST_ALREADY_RESOLVED";

  return prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: FriendshipStatus.ACCEPTED, respondedAt: new Date() },
    include: { requester: { select: FRIEND_USER_SELECT } },
  });
}

/** Recusa (destinatário) ou cancela (remetente) uma solicitação pendente. */
export async function dismissFriendRequest(
  userId: string,
  friendshipId: string
) {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });
  if (!friendship) throw "REQUEST_NOT_FOUND";
  if (friendship.addresseeId !== userId && friendship.requesterId !== userId)
    throw "NOT_ALLOWED";
  if (friendship.status !== FriendshipStatus.PENDING)
    throw "REQUEST_ALREADY_RESOLVED";

  await prisma.friendship.delete({ where: { id: friendshipId } });
}

export async function removeFriend(userId: string, friendUserId: string) {
  const { count } = await prisma.friendship.deleteMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [
        { requesterId: userId, addresseeId: friendUserId },
        { requesterId: friendUserId, addresseeId: userId },
      ],
    },
  });
  if (count === 0) throw "FRIENDSHIP_NOT_FOUND";
}

export async function listFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: {
      requester: { select: FRIEND_USER_SELECT },
      addressee: { select: FRIEND_USER_SELECT },
    },
    orderBy: { respondedAt: "desc" },
  });

  return friendships.map((friendship) => ({
    friendshipId: friendship.id,
    since: friendship.respondedAt,
    user:
      friendship.requesterId === userId
        ? friendship.addressee
        : friendship.requester,
  }));
}

/** Busca usuários por nome para convite, anotando a relação existente. */
export async function searchUsers(userId: string, query: string) {
  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      name: { contains: query, mode: "insensitive" },
    },
    select: FRIEND_USER_SELECT,
    take: 10,
    orderBy: { name: "asc" },
  });
  if (users.length === 0) return [];

  const relations = await prisma.friendship.findMany({
    where: {
      OR: users.flatMap((user) => [
        { requesterId: userId, addresseeId: user.id },
        { requesterId: user.id, addresseeId: userId },
      ]),
    },
  });

  return users.map((user) => {
    const relation = relations.find(
      (f) => f.requesterId === user.id || f.addresseeId === user.id
    );
    return { ...user, relation: relation?.status ?? "NONE" };
  });
}

export async function listFriendRequests(userId: string) {
  const [incoming, outgoing] = await Promise.all([
    prisma.friendship.findMany({
      where: { addresseeId: userId, status: FriendshipStatus.PENDING },
      include: { requester: { select: FRIEND_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { requesterId: userId, status: FriendshipStatus.PENDING },
      include: { addressee: { select: FRIEND_USER_SELECT } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    incoming: incoming.map((f) => ({
      friendshipId: f.id,
      createdAt: f.createdAt,
      user: f.requester,
    })),
    outgoing: outgoing.map((f) => ({
      friendshipId: f.id,
      createdAt: f.createdAt,
      user: f.addressee,
    })),
  };
}
