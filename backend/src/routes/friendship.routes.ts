import express from "express";
import authorize from "@/routes/middlewares/auth";
import requireRegistered from "@/routes/middlewares/requireRegistered";
import {
  handleAcceptFriendRequest,
  handleDismissFriendRequest,
  handleListFriendRequests,
  handleListFriends,
  handleRemoveFriend,
  handleSearchUsers,
  handleSendFriendRequest,
} from "@/controller/friendship.controller";

export default express()
  .use(authorize, requireRegistered)
  .get("/", handleListFriends)
  .get("/search", handleSearchUsers)
  .get("/requests", handleListFriendRequests)
  .post("/requests", handleSendFriendRequest)
  .post("/requests/:id/accept", handleAcceptFriendRequest)
  .delete("/requests/:id", handleDismissFriendRequest)
  .delete("/:userId", handleRemoveFriend);
