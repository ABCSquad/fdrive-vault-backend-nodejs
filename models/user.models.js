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
    devices: [
      {
        signalProtocolAddress: {
          type: String,
          required: true,
        },
        session: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Session",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export { User };
