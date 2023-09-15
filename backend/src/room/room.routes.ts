import express from "express";
import {
  handleCreateRoom,
  handleJoinRoom,
  handleListRooms,
  handleGetRoomByHash,
} from "./room.controller";
import authorize from "../routes/middlewares/auth";

export default express()
  .post("/", authorize, handleCreateRoom)
  .get("/", authorize, handleListRooms)
  .get("/hash/:hash", authorize, handleGetRoomByHash)
  .post("/join/:hash", authorize, handleJoinRoom);
