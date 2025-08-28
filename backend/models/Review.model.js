//review.model.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Rating is required"]
  },
  reviewText: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ["pending", "confirmed"],
    default: "confirmed",
  },
}, {
  timestamps: true
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
