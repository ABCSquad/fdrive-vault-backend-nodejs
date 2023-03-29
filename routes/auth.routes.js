import { Router } from "express";
var router = Router();
import { login } from "../controllers/auth.controllers.js";

router.post("/login", login);

export default router;
