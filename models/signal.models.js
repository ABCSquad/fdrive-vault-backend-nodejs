import mongoose from "mongoose";

const preKeyBundleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  preKeyBundle: {
    type: Object,
  },
});

const sessionSchema = new mongoose.Schema({
  sessionCipher: {
    type: Object,
  },
  startTime: {
    type: Date,
  },
});

const PreKeyBundle = mongoose.model("PreKeyBundle", preKeyBundleSchema);
const Session = mongoose.model("Session", sessionSchema);

export { PreKeyBundle, Session };
