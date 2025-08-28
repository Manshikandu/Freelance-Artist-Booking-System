
import Artist from "../models/Artist.model.js";

export const UpdateArtist = async (req, res) => {
  const artistId = req.params.id;
  const updateFields = req.body;

  if (!artistId) {
    return res.status(400).json({ error: "Missing artistId" });
  }

  try {
    const allowedFields = [
      "username",
      "category",
      "location",
      "bio",
      "portfolioLink",
      "media",
      "imageUrl",
      "description",
      "videoUrl",
      "wage",
      "profilePicture",
      "genres",
      "eventTypes",
      "languages",
      "specialties",

    ];

    const filteredUpdate = {};

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined) {
        if (field === "location") {
          const loc = updateFields.location;

          console.log("Location type:", loc?.type);
          console.log("Coordinates:", loc?.coordinates);
          console.log("City:", loc?.city);

          if (
            loc &&
            typeof loc === "object" &&
            loc.type === "Point" &&
            Array.isArray(loc.coordinates) &&
            loc.coordinates.length === 2 &&
            typeof loc.city === "string"
          ) {
            filteredUpdate.location = {
              type: "Point",
              coordinates: loc.coordinates,
              city: loc.city,
            };
          } else {
           
            return res.status(400).json({ error: "Invalid location format" });
          }
        } else {
          filteredUpdate[field] = updateFields[field];
        }
      }
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      artistId,
      { $set: filteredUpdate },
      { new: true, runValidators: true }
    );

    if (!updatedArtist) {
      return res.status(404).json({ message: "Artist profile not found." });
    }

    return res.json({
      message: "Artist profile updated successfully.",
      artist: updatedArtist,
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
};


export const ArtistProfile = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ error: "Artist profile not found." });
    }
    res.json(artist);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch artist profile", details: error.message });
  }
};


export const upload = async(req,res) =>
{
    try{
        const {artistId, media} = req.body;
        const artist = await Artist.findById(artistId);

        if(!artist)
        {
            return res.status(404).json({message: 'Artist not found'});
        }
        
        artist.media.push(media);
        await artist.save();

        res.status(200).json({message: 'Media uploaded', media: artist.media});
    }
    catch(error)
    {
        res.status(500).json({message: "Server error", error: error.message});
    }
};

export const getAllArtists = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category: category.toLowerCase() } : {};
    const artists = await Artist.find(filter);
    res.status(200).json(artists);
  } catch (err) {
    console.error("Error fetching artists:", err);
    res.status(500).json({ error: "Failed to fetch artists" });
  }
};