import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { WebSocketServer } from "ws";
import server from "../index.js";

// TODO: Use a database to store the companionConnections
export const companionConnections = new Map();
export const primaryConnections = new Map();

const sessionInitiate = asyncHandler(async (req, res) => {
  const token = generateToken();
  const ws = createWebsocketConnection(req, token, "companion");
  res.status(200).json({ message: "Session initiated", data: token });
});

const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!isValidToken(token)) {
    return res.status(400).json({ message: "Token is invalid", data: null });
  }

  // Close the websocket connection
  closeWebsocketConnection(token);

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
function createWebsocketConnection(req, token, deviceType) {
  const ws = new WebSocketServer({ server: server, path: `/token/${token}` });
  ws.on("connection", (ws) => {
    console.log("Websocket connection established with token " + token);
    ws.on("message", (message) => {
      ws.send(`Hey, client ${token}!`);
      console.log(`${token} says: ${message}`);
    });
    ws.on("close", () => {
      console.log("Websocket connection closed");
    });
  });
  if (deviceType === "primary") {
    primaryConnections.set(token, ws); // associate the token with the websocket connection
  } else {
    companionConnections.set(token, ws);
  }
  return ws;
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
