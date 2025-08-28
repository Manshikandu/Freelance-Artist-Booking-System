import express from "express";
import { createReview, getClientReviews, getReviewsForArtist,getAllReviews } from "../controllers/ClientReview.controller.js"
import { verifytoken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifytoken , createReview);
router.get("/me", verifytoken, getClientReviews);
router.get("/artist/:artistId", getReviewsForArtist);
router.get("/all", getAllReviews);

export default router;  