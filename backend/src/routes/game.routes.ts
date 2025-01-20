import express from "express";
import authorize from "./middlewares/auth";
import { getGameByHash } from "../controller/game.controller";
export default express()
  .get("/:hash", authorize, getGameByHash)
