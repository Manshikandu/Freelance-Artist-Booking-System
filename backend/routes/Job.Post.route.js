import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createJobPost,
  getMyJobPosts,
  getJobPostById,
  deleteJobPost,getAllJobPosts,getAppliedJobPosts,applyToJobPost
} from "../controllers/Job.Post.Controller.js";
import { getMatchingJobPostsForArtist } from "../controllers/Recommendation.controller.js";

const router = express.Router();

router.post("/", protectRoute, createJobPost);
router.get("/my", protectRoute, getMyJobPosts);

router.delete("/:id", protectRoute, deleteJobPost);
router.get("/", getAllJobPosts);
router.get("/applied", protectRoute, getAppliedJobPosts);
router.get("/:id", getJobPostById);

router.post("/:id/apply", protectRoute, applyToJobPost);
router.get("/match-for-artist", getMatchingJobPostsForArtist);


export default router;
