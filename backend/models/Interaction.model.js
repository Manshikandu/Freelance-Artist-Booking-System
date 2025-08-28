import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
  jobPostId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPost", required: true },
  action: { type: String, enum: ["viewed", "applied", "skipped"], required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Interaction", interactionSchema);
