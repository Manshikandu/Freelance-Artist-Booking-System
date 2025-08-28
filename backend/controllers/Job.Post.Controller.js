import JobPost from "../models/JobPost.model.js";
import ApplicationModel from "../models/Application.model.js";

//  Create Job Post (Client Only)
export const createJobPost = async (req, res) => {
  try {
    const { title, description, date, time, location, budget, artistType } = req.body;

    if (!title || !description || !date || !time || !location?.city || !budget || !artistType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({ message: "Date cannot be in the past" });
    }

    const newJobPost = new JobPost({
      client: req.user._id, // Link post to logged-in client
      title,
      description,
      date: selectedDate,
      time,
      location,
      budget,
      artistType,
      status: "pending",
    });

    await newJobPost.save();
    res.status(201).json(newJobPost);
  } catch (error) {
    console.error("Error creating job post:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const getMyJobPosts = async (req, res) => {
  try {
    const posts = await JobPost.find({ client: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch applicants for each post
    const postIds = posts.map((post) => post._id);
    const applications = await ApplicationModel.find({ jobPostId: { $in: postIds } })
      .populate("artistId", "username profilePicture category")
      .lean();

    const postIdToApplicants = {};
    applications.forEach((app) => {
      const postId = app.jobPostId.toString();
      if (!postIdToApplicants[postId]) postIdToApplicants[postId] = [];
      postIdToApplicants[postId].push({
        artist: app.artistId,
        appliedAt: app.appliedAt,
        message: app.message,
        sampleURL: app.sampleURL,
      });
    });

    const postsWithApplicants = posts.map((post) => ({
      ...post,
      applicants: postIdToApplicants[post._id.toString()] || [],
    }));

    res.json(postsWithApplicants);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Get Single Job Post by ID
// export const getJobPostById = async (req, res) => {
//   try {
//     const post = await JobPost.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     res.json(post);
//   } catch (error) {
//     console.error("Error fetching post:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };



//get job post by ID
import mongoose from "mongoose";


export const getJobPostById = async (req, res) => {
  const { id } = req.params;

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job post ID" });
  }

  try {
    const jobPost = await JobPost.findById(id);

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.json(jobPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Delete a Job Post (Client Only)
export const deleteJobPost = async (req, res) => {
  try {
    const post = await JobPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//getLLjobposts
// export const getAllJobPosts = async (req, res) => {
//   try {
//     const posts = await JobPost.find().sort({ createdAt: -1 });
//     res.status(200).json(posts);
//   } catch (error) {
//     console.error("Error fetching job posts:", error);
//     res.status(500).json({ message: "Server error fetching job posts" });
//   }
// };
import ClientProfile from "../models/ClientProfile.model.js";

export const getAllJobPosts = async (req, res) => {
  try {
    // Step 1: Fetch all job posts
    const posts = await JobPost.find().sort({ createdAt: -1 }).lean();

    // Step 2: Collect all client User IDs
    const clientIds = posts.map(post => post.client);

    // Step 3: Fetch ClientProfile for each client
    const clientProfiles = await ClientProfile.find({ userId: { $in: clientIds } })
      .select("userId name avatar")
      .lean();

    // Step 4: Build map of userId → profile
    const profileMap = {};
    clientProfiles.forEach(profile => {
      profileMap[profile.userId.toString()] = profile;
    });

    // Step 5: Merge profile data into posts
    const enrichedPosts = posts.map(post => ({
      ...post,
      client: profileMap[post.client.toString()] || null, // fallback if no profile
    }));

    res.status(200).json(enrichedPosts);
  } catch (error) {
    console.error("Error fetching job posts:", error);
    res.status(500).json({ message: "Server error fetching job posts" });
  }
};



export const getAppliedJobPosts = async (req, res) => {
  try {
    const artistId = req.user._id;

    const appliedPosts = await ApplicationModel.find({  artistId })
      .populate("jobPostId");

    const posts = appliedPosts.map(app => ({
      jobPostId: app.jobPostId,
      appliedAt: app.appliedAt,
    }));

    res.json(posts); 
  } catch (err) {
    console.error("Error in getAppliedJobPosts:", err);
    res.status(500).json({ message: "Failed to fetch applied job posts" });
  }
};



export const applyToJobPost = async (req, res) => {
  try {
    const jobPostId = req.params.id;
    console.log("Job ID:", req.params.id);
    const artistId = req.user._id;
    console.log("User ID:", req.user?._id);


    // Check if job post exists
    const job = await JobPost.findById(jobPostId);
    if (!job) return res.status(404).json({ message: "Job post not found" });

    // Prevent duplicate applications
    const existing = await ApplicationModel.findOne({ artistId, jobPostId });
    if (existing) return res.status(400).json({ message: "Already applied to this job post" });

    // Create new application
    const application = new ApplicationModel({
      artistId,
      jobPostId,
      appliedAt: new Date()
    });

    await application.save();

    res.status(201).json({ message: "Applied successfully", application });
  } catch (err) {
    console.error("Apply Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};