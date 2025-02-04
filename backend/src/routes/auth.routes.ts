import express from "express";
import {
  handleValidateUser,
  handleValidateGuest,
  protectedRoute,
} from "@controller/auth.controller";
import authorize from "./middlewares/auth";
export default express()
  .post("/", handleValidateUser)
  .post("/guest", handleValidateGuest)
  .get("/protected", authorize, protectedRoute);
