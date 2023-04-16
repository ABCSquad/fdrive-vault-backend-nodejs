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
        sameChainEncrypted: true,
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
  let keys = await Key.find({ owner: owner._id });
  // Check if some keys dont have versions for requesting companion
  const missingKeys = keys.filter((keyObj) => {
    return (
      keyObj.keys.length < numberOfCompanions ||
      keyObj.keys.some((key) => key.sameChainEncrypted)
    );
  }); // Send response
  res.status(200).json({
    message: "Keys checked successfully",
    data: missingKeys,
  });
});

const updateKey = asyncHandler(async (req, res) => {
  const {
    username,
    missingCompanionsUpdatedKeys,
    existingCompanionsUpdatedKeys,
  } = req.body;
  console.log(missingCompanionsUpdatedKeys, existingCompanionsUpdatedKeys);
  // Iterate over missingCompanionUpdatedKeys
  let updatedKey;
  Object.keys(missingCompanionsUpdatedKeys).forEach(async (keyId) => {
    // Find key in database
    updatedKey = await Key.findByIdAndUpdate(
      keyId,
      {
        $push: { keys: missingCompanionsUpdatedKeys[keyId] },
      },
      {
        new: true,
      }
    );
  });
  // Iterate over existingCompanionsUpdatedKeys
  Object.keys(existingCompanionsUpdatedKeys).forEach(async (keyId) => {
    // Find key in database and update only the key and sameChainEncrypted
    updatedKey = await Key.findOneAndUpdate(
      {
        _id: keyId,
        "keys.sameChainEncrypted": true,
      },
      {
        $set: {
          "keys.$.key": existingCompanionsUpdatedKeys[keyId][0].key,
          "keys.$.sameChainEncrypted": false,
        },
      },
      {
        new: true,
      }
    );
  });
  // Send response
  res.status(200).json({
    message: "Keys updated successfully",
    data: null,
  });
});

export { uploadKey, checkKey, updateKey };
