// controllers/Artist.controller.js

import Artist from "../models/Artist.model.js";

export const filterArtists = async (req, res) => {
  try {
    const {  city,country,category, minPrice, maxPrice, availableFrom, availableTo } = req.query;

    const query = {};

    // Filter by location
    if (city) query["location.city"] = city;
    if (country) query["location.country"] = country;

    // Filter by category
    if (skill) query.category = category;

    // Filter by price range
    if (minPrice || maxPrice) {
      query["priceRange.min"] = { $lte: maxPrice || Infinity };
      query["priceRange.max"] = { $gte: minPrice || 0 };
    }

    // Filter by availability
    if (availableFrom && availableTo) {
      query.availability = {
        $elemMatch: {
          from: { $lte: new Date(availableFrom) },
          to: { $gte: new Date(availableTo) }
        }
      };
    }

    const artists = await Artist.find(query).select("-passwordHash");

    res.status(200).json(artists);
  } catch (err) {
    console.error("Error filtering artists:", err);
    res.status(500).json({ message: "Server error while filtering artists" });
  }
};
