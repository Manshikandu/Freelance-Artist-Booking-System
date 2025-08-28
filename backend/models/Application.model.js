import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
  jobPostId: { type: mongoose.Schema.Types.ObjectId, ref: "JobPost" },
  appliedAt: { type: Date, default: Date.now },
  deadline: { type: Date, required: false },
  message: { type: String },
  sampleURL: { type: String },


});

export default mongoose.model("Application", applicationSchema);
