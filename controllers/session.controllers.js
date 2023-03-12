import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { WebSocketServer } from "ws";

export const connections = new Map();

const sessionInitiate = asyncHandler(async (req, res) => {
  const token = generateToken();
  const ws = createWebsocketConnection(req, token);
  res.status(200).json({ message: "Session initiated", data: token });
});

const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!isValidToken(token)) {
    return res.status(200).json({ message: "Token is invalid", data: null });
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

  const ws = connections.get(token);

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
function createWebsocketConnection(req, token) {
  const ws = new WebSocketServer({ server: req.app.get("server") });
  connections.set(token, ws); // associate the token with the websocket connection
  return ws;
}

// Check if the token is valid
function isValidToken(token) {
  return connections.has(token);
}

// Close the associated websocket connection
function closeWebsocketConnection(token) {
  const ws = connections.get(token);
  if (ws) {
    ws.close();
    connections.delete(token);
  }
}

export { sessionInitiate, verifyToken, checkConnection };
