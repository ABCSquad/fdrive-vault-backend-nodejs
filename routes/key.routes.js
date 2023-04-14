import { Router } from "express";
var router = Router();
import { uploadKey, checkKey } from "../controllers/key.controllers.js";

router.post("/upload", uploadKey);

router.post("/check", checkKey);

export default router;
