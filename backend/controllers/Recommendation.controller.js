
import JobPost from "../models/JobPost.model.js";
import Artist from "../models/Artist.model.js";
import { haversine } from "../utils/haversine.js";
import { cosineSimilarity, tokenize } from "../utils/Similarity.js";

export const getMatchingJobPostsForArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.user._id);
    if (!artist) return res.status(404).json({ message: "Artist not found" });

    const now = new Date();

    const posts = await JobPost.find({
      deadline: { $gt: now },
      date: { $exists: true }
    }).lean();

    const artistLat = artist.location?.coordinates?.[1] ?? 0;
    const artistLng = artist.location?.coordinates?.[0] ?? 0;
    const artistAvailDate = artist.availabilityDate ? new Date(artist.availabilityDate) : null;

    const matches = posts.map(post => {
      const categoryScore = post.category === artist.category ? 1 : 0;

      const titleScore = cosineSimilarity(
        tokenize(post.title || ""),
        tokenize((artist.genres || []).join(" "))
      );

      const postLat = post.location?.lat ?? 0;
      const postLng = post.location?.lng ?? 0;

      const distanceKm = haversine(artistLat, artistLng, postLat, postLng);
      const distanceScore = 1 - Math.min(distanceKm / 100, 1);

      const budgetScore =
        post.budget >= artist.rate
          ? 1
          : Math.max(0, 1 - (artist.rate - post.budget) / artist.rate);

      let dateScore = 0;
      if (artistAvailDate && post.date) {
        const jobDate = new Date(post.date);
        const diffDays = Math.abs(jobDate - artistAvailDate) / (1000 * 60 * 60 * 24);
        dateScore = Math.max(0, 1 - diffDays / 14);
      }

      const score =
        0.25 * categoryScore +
        0.25 * titleScore +
        0.2 * distanceScore +
        0.1 * budgetScore +
        0.2 * dateScore;

      return {
        ...post,
        score,
      };
    });

    const topMatches = matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(topMatches);
  } catch (err) {
    console.error("Job match error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
