import asyncHandler from "express-async-handler";
import { PreKeyBundle } from "../models/signal.models.js";
import { User } from "../models/user.models.js";

const login = asyncHandler(async (req, res) => {
  const { username, signalProtocolAddress, preKeyBundle } = req.body;
  let user = await User.findOneAndDelete({ username });
  if (user) {
    // Delete prekeybundle associated with user
    await PreKeyBundle.deleteOne({ user: user._id });
  }
  const createdUser = await User.create({
    username,
    signalProtocolAddress,
  });
  user = await User.findOne({ username });
  const createdPreKeyBundle = await PreKeyBundle.create({
    user: user._id,
    preKeyBundle,
  });

  // Send response
  res
    .status(200)
    .json({ message: "Logged in user, saved preKeyBundle", data: createdUser });
});

export { login };
