import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    signalProtocolAddress: {
      type: String,
    },
    devices: {
      type: [
        {
          signalProtocolAddress: {
            type: String,
            required: true,
          },
          deviceInfo: {
            type: Object,
          },
        },
      ],
      default: [],
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User };
