import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    location: {
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, default: "Nepal" },
    },
    budget: { type: Number },
    artistType: [{ type: String }],
  },
  { timestamps: true }
);

const JobPost = mongoose.model("JobPost", jobPostSchema);
export default JobPost;
