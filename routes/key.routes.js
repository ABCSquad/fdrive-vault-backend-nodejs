import { Router } from "express";
var router = Router();
import {
  uploadKey,
  checkKey,
  updateKey,
} from "../controllers/key.controllers.js";

router.post("/upload", uploadKey);

router.post("/check", checkKey);

router.post("/update", updateKey);

export default router;
