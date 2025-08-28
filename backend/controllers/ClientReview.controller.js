import Review from "../models/Review.model.js"; 
import Booking from "../models/Artist.Booking.model.js";
import Artist from "../models/Artist.model.js";
import { createNotificationAndEmit } from "./Notification.controller.js"; 
import { updateArtistBayesianRating } from "../utils/RatingUtils.js";

export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, reviewText } = req.body;
    const clientId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    const artistId = booking.artist; 

    const existingExact = await Review.findOne({
      clientId,
      bookingId,
      reviewText: reviewText.trim(),
    });
    if (existingExact) {
      return res.status(400).json({ message: "Duplicate review detected." });
    }

    const recentReview = await Review.findOne({
      clientId,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
    });
    if (recentReview) {
      return res.status(429).json({
        message: "You are submitting reviews too quickly. Please wait.",
      });
    }

    if (reviewText.length < 5 || reviewText.length > 500) {
      return res.status(400).json({
        message: "Review length must be between 5 and 500 characters.",
      });
    }

    if (/(.)\1{4,}/.test(reviewText)) {
      return res.status(400).json({
        message: "Review contains suspicious character patterns.",
      });
    }

    const newReview = new Review({
      bookingId,
      clientId,
      artistId,
      rating,
      reviewText,
      status: "confirmed",
    });

    await newReview.save();

    const artist = await Artist.findById(artistId).select('username');
    const artistName = artist?.username || 'Unknown Artist';
    
    console.log(` New Review: Rating ${rating}/5 for ${artistName} (${artistId})`);
    await updateArtistBayesianRating(artistId);

    await createNotificationAndEmit({
      userId: artistId,
      userType: "artist",
      type: "review",
      message: `You received a new review from a client.`,
    });


    res
      .status(201)
      .json({ message: "Review created successfully", review: newReview });
  } catch (error) {
    res.status(500).json({ message: "Failed to create review", error: error.message });
  }
};

export const getClientReviews = async (req, res) => {
  try {
    const clientId = req.user._id;
    const reviews = await Review.find({ clientId }).populate("artistId", "username");
    
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
};

import ClientProfile from "../models/ClientProfile.model.js";

export const getReviewsForArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const artist = await Artist.findById(artistId).select('username weightedRating rawAverageRating totalRatings');
    const artistName = artist?.username || 'Unknown Artist';
    const reviews = await Review.find({ artistId, status: "confirmed" })
      .populate("clientId", "username email");

    // Fetch all client profiles 
    const clientIds = reviews.map(r => r.clientId?._id).filter(Boolean);
    const profiles = await ClientProfile.find({ userId: { $in: clientIds } });
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.userId.toString()] = profile;
    });
    const reviewsWithProfile = reviews.map(r => {
      let clientProfile = profileMap[r.clientId?._id?.toString()];
      let profileObj = clientProfile ? clientProfile.toObject() : null;
      if (profileObj) {
        if (!profileObj.profilePicture) profileObj.profilePicture = {};
        profileObj.profilePicture.url = profileObj.profilePicture.url || profileObj.avatar || "";
      }
      return {
        ...r.toObject(),
        clientProfile: profileObj
      };
    });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) : 0;

    console.log(` Fetching Reviews for ${artistName}:`);
    console.log(`   Total Reviews: ${totalReviews}`);
    console.log(`   Average Rating: ${avgRating.toFixed(2)}/5 (${totalReviews > 0 ? `sum: ${reviews.reduce((sum, review) => sum + review.rating, 0)} ÷ ${totalReviews}` : 'no reviews'})`);
    console.log(`   Raw Average: ${artist?.rawAverageRating || 'N/A'} (stored DB avg)`);
    console.log(`   Weighted Rating: ${artist?.weightedRating || 'N/A'} (Bayesian: raw + global blend)`);
    console.log(`   Logic: Few reviews → closer to global avg, Many reviews → closer to raw avg`);

    res.status(200).json(reviewsWithProfile);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch artist reviews", error: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const allReviews = await Review.find({ status: "confirmed" }).select("rating");
    
    const totalReviews = allReviews.length;
    const globalAvg = totalReviews > 0 ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) : 4.0;
    
    console.log(` Fetching All Reviews for Global Average:`);
    console.log(`   Total Platform Reviews: ${totalReviews}`);
    console.log(`   Global Average: ${globalAvg.toFixed(2)}/5`);
    
    res.status(200).json(allReviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all reviews", error: error.message });
  }
};