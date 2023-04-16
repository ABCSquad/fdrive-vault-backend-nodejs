import mongoose, { Schema } from "mongoose";

const keySchema = new mongoose.Schema({
  file: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  keys: [
    {
      companionAddress: {
        type: String,
        required: true,
      },
      key: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
      uploader: {
        type: Boolean,
        required: true,
        default: false,
      },
      sameChainEncrypted: {
        type: Boolean,
        default: undefined,
      },
    },
  ],
});

const Key = mongoose.model("Key", keySchema);

export { Key };
