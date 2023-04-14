import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import toobusy from "toobusy-js";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./middlewares/logger.middleware.js";
import cookieParser from "cookie-parser";
import {
  companionConnections,
  generateToken,
} from "./controllers/session.controllers.js";
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
import keyRouter from "./routes/key.routes.js";
import userRouter from "./routes/user.routes.js";
import { User } from "./models/user.models.js";
import { PreKeyBundle } from "./models/signal.models.js";

//Parent routes
app.use("/api/", homeRouter);
app.use("/api/session", sessionRouter);
app.use("/api/auth", authRouter);
app.use("/api/key", keyRouter);
app.use("/api/user", userRouter);

//Middlewares (Post routes)
app.use(errorHandler);

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server listening port ${process.env.PORT || 5000}`);
});

const wss = new WebSocketServer({ port: 7071 });
const companions = new Map();
const primaries = new Map();
wss.on("connection", (ws, request) => {
  const url = request.url;
  /**
   * Session Initialization
   */
  if (url === "/initiate") {
    const token = generateToken();
    companions.set(ws, token);
    ws.send(JSON.stringify({ type: "success", token }));
    ws.on("message", async (message) => {
      const data = JSON.parse(message);
      if (data.type === "preKeyWhisperMessage") {
        // Send message to primary to test decryption and create session
        const messageToPrimary = {
          type: "preKeyWhisperMessage",
          data: data.data,
        };
        const token = companions.get(ws);
        const primaryWS = getKeyByValue(primaries, token);
        primaryWS.send(JSON.stringify(messageToPrimary));
      }
    });

    /**
     * Companion Connection
     */
  } else if (url === `/companion/${companions.get(ws)}`) {
    console.log("Companion connected");
    /**
     * Primary Connection with token verification
     */
  } else if (url.startsWith(`/primary`)) {
    const token = url.split("/")[2];
    // Check if token is correct
    const companionWS = getKeyByValue(companions, token);
    if (!companionWS) {
      ws.close(1008, "Invalid token");
    }
    primaries.set(ws, token);
    ws.send(JSON.stringify({ type: "success", token }));

    // Waiting for preKeyBundle from primary
    ws.on("message", async (message) => {
      const data = JSON.parse(message);
      if (data.type === "primaryInformation") {
        // Get preKeyBundle from database
        // Get user id from database
        const user = await User.findOne({ username: data.username });
        // Get preKeyBundle from database
        const preKeyBundleContainer = await PreKeyBundle.findOne({
          user: user._id,
        });
        // Send message to companion
        const messageToCompanion = {
          type: "primaryInformation",
          data: {
            preKeyBundle: preKeyBundleContainer.preKeyBundle,
            primarySignalProtocolAddress: data.signalProtocolAddress,
            primaryUsername: data.username,
          },
        };
        companionWS.send(JSON.stringify(messageToCompanion));
      }
      if (data.type === "whisperMessage") {
        // Send whisperMessage to companion
        const messageToCompanion = {
          type: "whisperMessage",
          data: data.data,
        };
        companionWS.send(JSON.stringify(messageToCompanion));
        companionWS.close();
        companions.delete(companionWS);
        ws.close();
        primaries.delete(ws);
      }
    });
  } else if (url === "/companion/preKeyWhisperMessage") {
    ws.on("message", async (message) => {
      const data = JSON.parse(message);
      if (data.type === "preKeyWhisperMessage") {
        // Send message to primary to test decryption and create session
        const messageToPrimary = {
          type: "preKeyWhisperMessage",
          data: data.data,
        };
        const token = companions.get(ws);
        const primaryWS = getKeyByValue(primaries, token);
        primaryWS.send(JSON.stringify(messageToPrimary));
      }
    });
  } else {
    ws.close(1008, "Invalid URL");
  }

  ws.on("close", () => {
    companions.delete(ws);
    console.log(`Client disconnected, ${companions.size} remaining`);
  });
});

function getKeyByValue(map, value) {
  for (const [key, val] of map.entries()) {
    if (val === value) {
      return key;
    }
  }
  return null;
}

export default server;
