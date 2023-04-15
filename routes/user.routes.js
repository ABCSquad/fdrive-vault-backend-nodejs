import { Router } from "express";
var router = Router();
import { addCompanion, getUserKeys } from "../controllers/user.controllers.js";

router.post("/companion/add", addCompanion);

router.get("/:username/:registrationId/key", getUserKeys);

export default router;
