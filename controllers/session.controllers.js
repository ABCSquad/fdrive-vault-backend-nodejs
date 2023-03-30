import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { WebSocketServer } from "ws";
import server from "../index.js";
import { parse } from "url";
import { PreKeyBundle } from "../models/signal.models.js";
import { User } from "../models/user.models.js";

// TODO: Use a database to store the companionConnections
export const companionConnections = new Map();
export const primaryConnections = new Map();

const sessionInitiate = asyncHandler(async (req, res) => {
  const token = generateToken();
  createWebsocketConnection(token, "companion");
  res.status(200).json({ message: "Session initiated", data: token });
});

const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!isValidToken(token)) {
    return res.status(400).json({ message: "Token is invalid", data: null });
  }

  // Create web socket connection for primary
  // createWebsocketConnection(token, "primary");

  res.status(200).json({ message: "Token verified", data: null });
});

const checkConnection = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!isValidToken(token)) {
    return res.status(400).json({ message: "Token is invalid", data: null });
  }

  const ws = companionConnections.get(token);

  if (ws.readyState === WebSocketServer.OPEN) {
    res.status(200).json({ message: "Connection is open", data: null });
  } else {
    res.status(200).json({ message: "Connection is closed", data: null });
  }
});

// Generate a unique token
function generateToken() {
  const token = crypto.randomBytes(16).toString("hex");
  return token;
}

// Create a websocket connection associated with the token
function createWebsocketConnection(token, deviceType) {
  const wss1 = new WebSocketServer({ noServer: true });
  const wss2 = new WebSocketServer({ noServer: true });
  server.on("upgrade", (request, socket, head) => {
    const pathname = parse(request.url).pathname;

    if (pathname === `/companion/${token}`) {
      wss1.handleUpgrade(request, socket, head, (ws) => {
        wss1.emit("connection", ws);

        // Send message
        ws.send(`Hey, client ${token}!`);

        ws.on("message", (message) => {
          console.log(`${token} says: ${message}`);
        });
        companionConnections.set(token, ws);
      });
    } else if (pathname === `/primary/${token}`) {
      wss2.handleUpgrade(request, socket, head, (ws) => {
        wss2.emit("connection", ws);

        // Send message
        ws.send(`Hey, client ${token}!`);

        ws.on("message", async (message) => {
          // Parse message
          const data = JSON.parse(message);
          // Determine type of message
          if (data.type === "initialPrimaryX3DHMessage") {
            console.log(
              "Determined it's the primary's initial X3DH message from",
              data.username
            );
            // Get user id from database
            const userId = await User.findOne({ username: data.username });
            // Get preKeyBundle from database
            const preKeyBundleContainer = await PreKeyBundle.findOne({
              user: userId,
            });
            // Send message to companion
            const messageToCompanion = {
              type: "primaryPreKeyBundle",
              preKeyBundle: preKeyBundleContainer.preKeyBundle,
            };
            const companionConnection = companionConnections.get(token);
            companionConnection.send(JSON.stringify(messageToCompanion));
          }
        });
        primaryConnections.set(token, ws); // associate the token with the websocket connection
      });
    } else {
      socket.destroy();
    }
  });
}

// Check if the token is valid
function isValidToken(token) {
  return companionConnections.has(token);
}

// Close the associated websocket connection
function closeWebsocketConnection(token) {
  const ws = companionConnections.get(token);
  if (ws) {
    ws.close();
    companionConnections.delete(token);
  }
}

export { sessionInitiate, verifyToken, checkConnection };
