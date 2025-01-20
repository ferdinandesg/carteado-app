import express from "express";
import { handleValidateUser } from "@controller/auth.controller";
export default express().post("/", handleValidateUser);
