import Artist from "../models/Artist.model.js"; 
import Booking from "../models/Artist.Booking.model.js";

/// Fetch artists by category for client browsing
export const getArtistsByCategory = async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice } = req.query; // get query parameters
    let filter = { role: "artist", category: new RegExp(`^${category}$`, "i") };

    // Apply location filter if provided
    if (location) {
      filter.location = new RegExp(`^${location}$`, "i"); // Case-insensitive match for location
    }

    // Apply price filters if provided
    if (minPrice || maxPrice) {
      filter.wage = {};
      if (minPrice) filter.wage.$gte = minPrice; // Greater than or equal to minPrice
      if (maxPrice) filter.wage.$lte = maxPrice; // Less than or equal to maxPrice
    }

    const artists = await Artist.find(filter); // Apply all filters

    res.status(200).json({
      success: true,
      count: artists.length,
      artists,
    });
  } catch (error) {
    console.error("Error fetching artists by category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search artists by username, category, location (with price and location filters)
export const searchArtists = async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase().trim();
    const { location, minPrice, maxPrice } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Build the filter object
    let filter = { role: "artist" };
    
    if (location) {
      filter.location = new RegExp(`^${location}$`, "i"); // Location filter
    }

    // Apply price filters if provided
    if (minPrice || maxPrice) {
      filter.wage = {};
      if (minPrice) filter.wage.$gte = minPrice; // Greater than or equal to minPrice
      if (maxPrice) filter.wage.$lte = maxPrice; // Less than or equal to maxPrice
    }

    const allArtists = await Artist.find(filter); // Find artists by filters

    const scoredArtists = allArtists.map((artist) => {
      const username = artist.username?.toLowerCase() || "";
      const category = artist.category?.toLowerCase() || "";
      const location = artist.location?.toLowerCase() || "";

      // Find index of query in each field (-1 if not found)
      const usernameIndex = username.indexOf(query);
      const categoryIndex = category.indexOf(query);
      const locationIndex = location.indexOf(query);

      // Find minimum index that is not -1
      const indexes = [usernameIndex, categoryIndex, locationIndex].filter(i => i !== -1);
      const score = indexes.length ? Math.min(...indexes) : Infinity;

      return { artist, score };
    });

    // Filter out artists where score is Infinity (query not found)
    const filtered = scoredArtists.filter(entry => entry.score !== Infinity);

    // Sort by score (lowest index first)
    filtered.sort((a, b) => a.score - b.score);

    // Return only artists
    const results = filtered.map(entry => entry.artist);

    res.status(200).json({ success: true, count: results.length, artists: results });
  } catch (error) {
    console.error("Error searching artists:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get Artist profile by ID.
export const GetArtistProfile = async(req, res) => {
    try{
        const artist = await Artist.findById(req.params.id);
        if(!artist)
        {
            return res.status(404).json({error: 'Not found'});
        }
        res.json(artist);
    }
    catch(error)
    {
        res.status(500).json({error: 'Fetch error'});
    }
};





export const getClientBookings = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    if (!clientId) {
      return res.status(400).json({ message: "Client ID is required" });
    }

    const bookings = await Booking.find({ clientId }).populate(
      "artistId",
      "username category location"
    );

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Error fetching client bookings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};