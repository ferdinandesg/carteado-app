import { Message, Prisma } from '@prisma/client';
import RedisClass from './client';
import GameClass from '../game/game';

type PopulatedRoom = Prisma.RoomGetPayload<{
  include: {
    players: {
      include: {
        user: true
      }
    };
  }
}>

export async function getRoomState(roomId: string): Promise<PopulatedRoom | null> {
  const redis = await RedisClass.getInstance();
  const data = await redis.get(`game:${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function saveRoomState(roomId: string, roomState: object) {
  const redis = await RedisClass.getInstance();
  await redis.set(`game:${roomId}`, JSON.stringify(roomState), {
    EX: 3600,
  });
}

export async function saveGameState(roomId: string, game: GameClass) {
  const redis = await RedisClass.getInstance();
  const serializedGame = game.serialize();
  await redis.set(`game:${roomId}`, serializedGame, {
    EX: 3600,
  });
}

export async function getGameState(roomId: string): Promise<GameClass | null> {
  const redis = await RedisClass.getInstance();
  const serializedGame = await redis.get(`game:${roomId}`);
    if (serializedGame) {
        return GameClass.deserialize(serializedGame);
    }
    return null;
}

export async function getMessages(roomId: string) {
  const redis = await RedisClass.getInstance()
  const data = await redis.get(`chat:${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function saveMessages(roomId: string, messages: Message[]) {
  const redis = await RedisClass.getInstance();
  await redis.set(`chat:${roomId}`, JSON.stringify(messages), {
    EX: 3600,
  });
}