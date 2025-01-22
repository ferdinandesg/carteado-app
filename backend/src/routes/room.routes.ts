import express from "express";
import {
  handleCreateRoom,
  handleGetRoom,
  handleListRooms,
} from "@controller/room.controller";
import authorize from "@routes/middlewares/auth";

export default express()
  .post("/", authorize, handleCreateRoom)
  .get("/", authorize, handleListRooms)
  .get("/:hash", authorize, handleGetRoom);
