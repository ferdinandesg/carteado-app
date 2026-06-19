import express from "express";
import {
  getCurrentUser,
  handleValidateUser,
  handleValidateGuest,
  protectedRoute,
} from "@/controller/auth.controller";
import authorize from "./middlewares/auth";
export default express()
  .post("/", handleValidateUser)
  .post("/guest", handleValidateGuest)
  .get("/me", authorize, getCurrentUser)
  .get("/protected", authorize, protectedRoute);
