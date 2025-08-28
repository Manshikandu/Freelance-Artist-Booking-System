import JobPost from "../models/JobPost.model.js";
import Application from "../models/Application.model.js";

export const getJobPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid job post ID" });
    }
    const jobPost = await JobPost.findById(id);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }
    res.json(jobPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching job post" });
  }
};


export const submitApplication = async (req, res) => {
  const { message, sampleURL } = req.body;
  const jobPostId = req.params.id;
  const artistId = req.user._id;

  const exists = await Application.findOne({ jobPostId, artistId });
  if (exists) return res.status(400).json({ message: "Already applied" });

  const app = new Application({
    artistId,
    jobPostId,
    message,
    sampleURL
  });

  await app.save();
  res.status(201).json({ message: "Application submitted successfully" });
};
