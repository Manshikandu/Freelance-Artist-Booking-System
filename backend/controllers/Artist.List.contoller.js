import Artist from "../models/Artist.model.js"; 
import Booking from "../models/Artist.Booking.model.js";

export const getArtistsByCategory = async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice } = req.query; 
    let filter = { role: "artist", category: new RegExp(`^${category}$`, "i") };

    if (location) {
      filter.location = new RegExp(`^${location}$`, "i"); 
    }

    if (minPrice || maxPrice) {
      filter.wage = {};
      if (minPrice) filter.wage.$gte = minPrice; 
      if (maxPrice) filter.wage.$lte = maxPrice; 
    }

    const artists = await Artist.find(filter); 
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

export const searchArtists = async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase().trim();
    const { location, minPrice, maxPrice } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    let filter = { role: "artist" };
    
    if (location) {
      filter.location = new RegExp(`^${location}$`, "i"); 
    }

    if (minPrice || maxPrice) {
      filter.wage = {};
      if (minPrice) filter.wage.$gte = minPrice; 
      if (maxPrice) filter.wage.$lte = maxPrice; 
    }

    const allArtists = await Artist.find(filter); 
    const scoredArtists = allArtists.map((artist) => {
      const username = artist.username?.toLowerCase() || "";
      const category = artist.category?.toLowerCase() || "";
      const location = artist.location?.toLowerCase() || "";

      const usernameIndex = username.indexOf(query);
      const categoryIndex = category.indexOf(query);
      const locationIndex = location.indexOf(query);

      const indexes = [usernameIndex, categoryIndex, locationIndex].filter(i => i !== -1);
      const score = indexes.length ? Math.min(...indexes) : Infinity;

      return { artist, score };
    });

    const filtered = scoredArtists.filter(entry => entry.score !== Infinity);

    filtered.sort((a, b) => a.score - b.score);

    const results = filtered.map(entry => entry.artist);

    res.status(200).json({ success: true, count: results.length, artists: results });
  } catch (error) {
    console.error("Error searching artists:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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