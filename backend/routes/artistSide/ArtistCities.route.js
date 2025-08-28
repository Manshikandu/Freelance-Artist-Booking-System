import express from "express";
import Artist from "../../models/Artist.model.js";

const router = express.Router();

// Get unique cities where artists are located
router.get("/artists/cities", async (req, res) => {
  try {
    const { search } = req.query;
    
    let matchStage = {};
    if (search) {
      matchStage = {
        $or: [
          { "location.city": { $regex: search, $options: "i" } },
          { "location.area": { $regex: search, $options: "i" } },
          { "location.district": { $regex: search, $options: "i" } }
        ]
      };
    }

    const cities = await Artist.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          cities: { $addToSet: "$location.city" },
          areas: { $addToSet: "$location.area" },
          districts: { $addToSet: "$location.district" }
        }
      },
      {
        $project: {
          allLocations: {
            $concatArrays: [
              { $ifNull: ["$cities", []] },
              { $ifNull: ["$areas", []] },
              { $ifNull: ["$districts", []] }
            ]
          }
        }
      }
    ]);

    const locations = cities.length > 0 
      ? cities[0].allLocations.filter(loc => loc && loc.trim())
      : [];

    // Remove duplicates and filter by search term if provided
    const uniqueLocations = [...new Set(locations)];
    const filteredLocations = search 
      ? uniqueLocations.filter(loc => 
          loc.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 5) // Limit to 5 suggestions
      : uniqueLocations.slice(0, 10);

    res.json(filteredLocations);
  } catch (error) {
    console.error("Error fetching artist cities:", error);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

export default router;
