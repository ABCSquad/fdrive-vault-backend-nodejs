import asyncHandler from "express-async-handler";
import { PreKeyBundle } from "../models/signal.models.js";
import { User } from "../models/user.models.js";

const login = asyncHandler(async (req, res) => {
  const { username, signalProtocolAddress, preKeyBundle } = req.body;
  // Save user to database if doesn't exist
  let user = await User.findOne({ username });
  if (!user) {
    user = await User.create({
      username,
      signalProtocolAddress,
    });
  }
  // Save preKeyBundle to database if doesn't exist
  let newPreKeyBundle = await PreKeyBundle.findOne({ user });
  if (!newPreKeyBundle) {
    newPreKeyBundle = await PreKeyBundle.create({
      user,
      preKeyBundle,
    });
  }

  // Send response
  res
    .status(200)
    .json({ message: "Logged in user, saved preKeyBundle", data: {} });
});

export { login };
