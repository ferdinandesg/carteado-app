import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  acceptFriendRequest,
  dismissFriendRequest,
  listFriendRequests,
  listFriends,
  removeFriend,
  sendFriendRequest,
} from "@/services/friendship.service";
import {
  friendshipIdParamSchema,
  friendUserIdParamSchema,
  sendFriendRequestSchema,
} from "@/schemas/friendship.schemas";
import { serializeRouteError } from "@/utils/routeError";
import { reqLogger } from "@/utils/logContext";

function handleError(req: Request, res: Response, error: unknown, log: string) {
  reqLogger(req).error({ err: error }, log);
  if (typeof error === "string") {
    res.status(400).json({ message: error });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json(serializeRouteError(error));
    return;
  }
  res.status(500).json(serializeRouteError(error));
}

export async function handleListFriends(req: Request, res: Response) {
  try {
    const friends = await listFriends(req.user.id);
    res.status(200).json(friends);
  } catch (error) {
    handleError(req, res, error, "Failed to list friends.");
  }
}

export async function handleListFriendRequests(req: Request, res: Response) {
  try {
    const requests = await listFriendRequests(req.user.id);
    res.status(200).json(requests);
  } catch (error) {
    handleError(req, res, error, "Failed to list friend requests.");
  }
}

export async function handleSendFriendRequest(req: Request, res: Response) {
  try {
    const { userId } = sendFriendRequestSchema.parse(req.body);
    const request = await sendFriendRequest(req.user.id, userId);
    reqLogger(req).info({ addresseeId: userId }, "Friend request sent.");
    res.status(201).json(request);
  } catch (error) {
    handleError(req, res, error, "Failed to send friend request.");
  }
}

export async function handleAcceptFriendRequest(req: Request, res: Response) {
  try {
    const { id } = friendshipIdParamSchema.parse(req.params);
    const friendship = await acceptFriendRequest(req.user.id, id);
    reqLogger(req).info({ friendshipId: id }, "Friend request accepted.");
    res.status(200).json(friendship);
  } catch (error) {
    handleError(req, res, error, "Failed to accept friend request.");
  }
}

export async function handleDismissFriendRequest(req: Request, res: Response) {
  try {
    const { id } = friendshipIdParamSchema.parse(req.params);
    await dismissFriendRequest(req.user.id, id);
    reqLogger(req).info({ friendshipId: id }, "Friend request dismissed.");
    res.status(204).send();
  } catch (error) {
    handleError(req, res, error, "Failed to dismiss friend request.");
  }
}

export async function handleRemoveFriend(req: Request, res: Response) {
  try {
    const { userId } = friendUserIdParamSchema.parse(req.params);
    await removeFriend(req.user.id, userId);
    reqLogger(req).info({ friendUserId: userId }, "Friend removed.");
    res.status(204).send();
  } catch (error) {
    handleError(req, res, error, "Failed to remove friend.");
  }
}
