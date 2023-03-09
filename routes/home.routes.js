import { Router } from "express";
var router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Server up and running", data: null });
});

export default router;
