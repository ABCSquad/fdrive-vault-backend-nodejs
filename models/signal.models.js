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

const PreKeyBundle = mongoose.model("PreKeyBundle", preKeyBundleSchema);

export { PreKeyBundle };
