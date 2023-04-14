import asyncHandler from "express-async-handler";
import { User } from "../models/user.models.js";

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

export { addCompanion };
