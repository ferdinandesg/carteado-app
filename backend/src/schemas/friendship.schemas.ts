import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-f]{24}$/i, "Must be a valid user id");

export const sendFriendRequestSchema = z.object({
  userId: objectId,
});

export const friendshipIdParamSchema = z.object({
  id: objectId,
});

export const friendUserIdParamSchema = z.object({
  userId: objectId,
});
