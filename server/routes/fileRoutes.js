import express from "express";
import { fileController } from "../controllers/fileController.js";

const router = express.Router();

router.post("/convert", fileController);

export default router;
