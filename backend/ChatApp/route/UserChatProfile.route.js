
import express from "express";
import Artist from "../../models/Artist.model.js";
import Client from "../../models/ClientProfile.model.js";

const router = express.Router();

router.post("/profiles", async (req, res) => {
  const { ids } = req.body;

  try {
    const artists = await Artist.find({ _id: { $in: ids } }, "_id username profilePicture");
    const clients = await Client.find({ userId: { $in: ids } }, "_id name avatar");

    const formattedArtists = artists.map((a) => ({
      _id: a._id,
      username: a.username,
      profilePicture: a.profilePicture,
    }));

    const formattedClients = clients.map((c) => ({
      _id: c.userId,
      username: c.name, 
      profilePicture: { url: c.avatar }, 
    }));

    const users = [...artists, ...clients];

    res.json(users);
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).json({ message: "Failed to fetch user profiles" });
  }
});

export default router;

