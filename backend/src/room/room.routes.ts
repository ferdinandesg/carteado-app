import express from "express";
import {
  handleCreateRoom,
  handleJoinRoom,
  handleListRooms,
  handleGetRoomByHash
} from "./room.controller";

export default express()
  .post("/", handleCreateRoom)
  .get("/", handleListRooms)
  .get("/hash/:hash", handleGetRoomByHash)
  .post("/join/:hash", handleJoinRoom);
