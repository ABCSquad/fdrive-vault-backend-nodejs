import asyncHandler from "express-async-handler";
import { User } from "../models/user.models.js";
import { Key } from "../models/key.models.js";

const addCompanion = asyncHandler(async (req, res) => {
  const { username, companionDevice } = req.body;

  // Find user and add companionDevice if doesnt exist
  const updatedUser = await User.findOneAndUpdate(
    {
      username: username,
      "devices.signalProtocolAddress": {
        $ne: companionDevice.signalProtocolAddress,
      },
    },
    {
      $push: {
        devices: {
          signalProtocolAddress: companionDevice.address,
          deviceInfo: companionDevice.deviceInfo,
        },
      },
    },
    { new: true }
  );

  // Send response
  res.status(200).json({
    message: "Added companion successfully",
    data: updatedUser,
  });
});

const getUserKeys = asyncHandler(async (req, res) => {
  // Get username from params
  const { username, registrationId } = req.params;
  // Get owners id
  const user = await User.findOne({ username });
  // Get all keys for user
  const keys = await Key.find({ owner: user._id });
  // Check if some keys dont have versions for requesting companion
  const missingKeys = keys.filter((keyObj) => {
    return !keyObj.keys.some(
      (key) => key.companionAddress === `${username}.${registrationId}`
    );
  });
  // Send response
  res.status(200).json({
    message: "Keys fetched successfully",
    data: {
      missingKeys: missingKeys,
      keys: keys,
    },
  });
});

export { addCompanion, getUserKeys };
