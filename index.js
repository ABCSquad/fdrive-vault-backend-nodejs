import express from "express";
import http from "http";
import toobusy from "toobusy-js";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./middlewares/logger.middleware.js";
import cookieParser from "cookie-parser";
import { companionConnections } from "./controllers/session.controllers.js";
dotenv.config();

//Initialization
const app = express();
const server = http.createServer(app);

//Server load handler
app.use(function (req, res, next) {
  if (toobusy()) {
    // log if you see necessary
    res.status(503).json({ message: "Server Too Busy", data: null });
  } else {
    next();
  }
});

// Connect to DB
import connect from "./utils/db.js";
connect();

//Middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Routers
import homeRouter from "./routes/home.routes.js";
import sessionRouter from "./routes/session.routes.js";
import authRouter from "./routes/auth.routes.js";

//Parent routes
app.use("/api/", homeRouter);
app.use("/api/session", sessionRouter);
app.use("/api/auth", authRouter);

//Middlewares (Post routes)
app.use(errorHandler);

process.on("SIGINT", () => {
  console.log("Closing all companionConnections");
  companionConnections.forEach((ws, token) => {
    console.log("Closing connection " + token);
    ws.close();
  });
  console.log("Websocket companionConnections closed, exiting...");
  process.exit();
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Sandbox listening port ${process.env.PORT || 5000}`);
});

export default server;
