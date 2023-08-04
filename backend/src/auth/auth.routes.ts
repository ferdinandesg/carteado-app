import express from "express";
import { handleValidateUser } from "./auth.controller";
export default express().post("/", handleValidateUser);
