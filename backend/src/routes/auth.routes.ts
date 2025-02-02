import express from "express";
import {
  handleValidateUser,
  handleValidateGuest,
} from "@controller/auth.controller";
export default express()
  .post("/", handleValidateUser)
  .post("/guest", handleValidateGuest);
