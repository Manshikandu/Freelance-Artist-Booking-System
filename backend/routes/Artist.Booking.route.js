import express from "express";
import { createBooking, getMyBookings,getBookedSlotsForArtist, getBookingById , requestCancellationByClient, approveArtistCancellationByClient } from "../controllers/Artist.Booking.controller.js";
import { verifytoken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifytoken, createBooking);

router.get("/my-bookings", verifytoken, getMyBookings);


router.get("/artist/:artistId/booked-slots", getBookedSlotsForArtist);


router.get("/:id", verifytoken, getBookingById);

// router.patch("/:id/cancel", verifytoken, cancelBookingByClient);
router.patch("/:id/request-cancel", verifytoken, requestCancellationByClient);
router.patch("/:id/approve-cancel", verifytoken, approveArtistCancellationByClient);

// Artist requests cancellation
export default router;