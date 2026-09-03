import express from "express";
import authorize from "@/routes/middlewares/auth";
import {
  handleBuyProduct,
  handleEquipProduct,
  handleListProducts,
} from "@/controller/store.controller";

export default express()
  .get("/", handleListProducts)
  .post("/buy", authorize, handleBuyProduct)
  .patch("/equip", authorize, handleEquipProduct);
