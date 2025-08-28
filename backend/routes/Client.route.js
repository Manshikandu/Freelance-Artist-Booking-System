import express from "express"
import { createBooking, createJobPost, createReview } from "../controllers/Client.controller";

const router = express.Router();
router.post("/jobposts",createJobPost);
router.post("/createBooking",createBooking);
router.post("/:bookingId",createReview);


export default router;
