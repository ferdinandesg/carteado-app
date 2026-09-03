import express from "express";
import authorize from "@/routes/middlewares/auth";
import {
  handleBuyProduct,
  handleEquipProduct,
  handleListCatalog,
  handleUnequipSlot,
} from "@/controller/store.controller";

export default express()
  .use(authorize)
  .get("/", handleListCatalog)
  .post("/buy", handleBuyProduct)
  .patch("/equip", handleEquipProduct)
  .delete("/equip/:type", handleUnequipSlot);
