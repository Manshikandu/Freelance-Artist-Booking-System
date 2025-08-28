import express from "express";
import { getJobPostById, submitApplication } from "../controllers/Apply.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id", protectRoute, getJobPostById);
router.post("/:id", protectRoute, submitApplication);


export default router;
