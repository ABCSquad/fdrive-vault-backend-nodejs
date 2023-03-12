import { Router } from "express";
import {
  checkConnection,
  sessionInitiate,
  verifyToken,
} from "../controllers/session.controllers.js";
var router = Router();

router.route("/initiate").get(sessionInitiate);

router.route("/:token/verify").get(verifyToken);

router.route("/:token/check").get(checkConnection);

export default router;
