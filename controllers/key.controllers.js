import asyncHandler from "express-async-handler";
import { User } from "../models/user.models.js";
import { Key } from "../models/key.models.js";

const uploadKey = asyncHandler(async (req, res) => {
  const { file, username, companionAddress, key } = req.body;
  // Get owners id
  const owner = await User.findOne({ username });
  // Save key to database
  console.log({
    file: file,
    owner: owner._id,
    keys: {
      companionAddress: companionAddress,
      key: key,
    },
  });
  const createdKey = await Key.create({
    file: file,
    owner: owner._id,
    keys: [
      {
        companionAddress: companionAddress,
        key: key,
        uploader: true,
      },
    ],
  });
  // Send response
  res.status(200).json({
    message: "Saved file key to database successfully",
    data: createdKey,
  });
});

const checkKey = asyncHandler(async (req, res) => {
  const { username } = req.body;

  // Get owners id
  const owner = await User.findOne({ username });
  // Get number of companions for owner
  const numberOfCompanions = owner.devices.length;
  // Get all keys for owner
  const keys = await Key.find({ owner: owner._id });
  // Find keys that have dont have versions for all companions
  const keysToSend = keys.filter((key) => {
    return key.keys.length < numberOfCompanions;
  });
  console.log(keysToSend);
  // Send response
  res.status(200).json({
    message: "Keys checked successfully",
    data: keysToSend,
  });
});

export { uploadKey, checkKey };
