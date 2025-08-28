// utils/ratingUtils.js
import Review from "../models/Review.model.js";
import Artist from "../models/Artist.model.js";
import mongoose from "mongoose";

export const updateArtistBayesianRating = async (artistId) => {
  const m = 10; 
  const artistStats = await Review.aggregate([
    { $match: { artistId: new mongoose.Types.ObjectId(String(artistId)), status: "confirmed" } },
    {
      $group: {
        _id: "$artistId",
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const globalStats = await Review.aggregate([
    { $match: { status: "confirmed" } },
    {
      $group: {
        _id: null,
        globalAvg: { $avg: "$rating" },
      },
    },
  ]);

  const R = artistStats[0]?.avgRating || 0;
  const v = artistStats[0]?.totalRatings || 0;
  const C = globalStats[0]?.globalAvg || 0;

  const WR = ((v / (v + m)) * R) + ((m / (v + m)) * C);

  await Artist.findByIdAndUpdate(artistId, {
    weightedRating: WR.toFixed(2),
    rawAverageRating: R.toFixed(2),
    totalRatings: v,
  });
};
