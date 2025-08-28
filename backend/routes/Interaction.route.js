import express from "express";
import { logInteraction, getInteractionStats } from "../controllers/Interaction.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, logInteraction);
router.get("/stats", protectRoute, getInteractionStats);

export default router;
