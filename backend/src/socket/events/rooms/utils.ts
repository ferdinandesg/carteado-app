import { GamePlayer } from "shared/game";
import { Participant } from "shared/types";
import prisma from "src/prisma";

export async function createPlayers(
  participants: Participant[],
  roomId: string
): Promise<GamePlayer[]> {
  // 1. Prepara os dados para o `createMany`
  const playersToCreate = participants.map((p) => ({
    roomId,
    name: p.name,
    status: "choosing", // ou outro status inicial
    // O userId só é adicionado se o participante for um usuário registrado
    userId: p.isRegistered ? p.userId : undefined,
  }));

  // 2. Cria todos os registros de Player no banco de dados de uma vez
  await prisma.player.createMany({
    data: playersToCreate,
  });

  // 3. Busca todos os players recém-criados, incluindo a relação com User
  // É aqui que a "mágica" acontece. O Prisma fará o "join".
  const createdPlayers = await prisma.player.findMany({
    where: { roomId },
    include: {
      user: true, // Inclui o documento User se a relação existir
    },
  });
  const createdPlayersWithIds = createdPlayers.map((player) => ({
    ...player,
    userId:
      player.userId || participants.find((p) => p.name === player.name)?.userId,
  }));
  return createdPlayersWithIds as unknown as GamePlayer[];
}
