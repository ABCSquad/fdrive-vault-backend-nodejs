import { Router } from "express";
var router = Router();
import { addCompanion } from "../controllers/user.controllers.js";

router.post("/companion/add", addCompanion);

export default router;
