import express from "express";
import {
  handleCreateRoom,
  handleJoinRoom,
  handleListRooms,
} from "./room.controller";

export default express()
  .post("/", handleCreateRoom)
  .get("/", handleListRooms)
  .post("/join/:hash", handleJoinRoom);
