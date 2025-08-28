// import express from "express";
// import Artist from "../../models/Artist.model.js"; // Adjust this to your model path
// im
// const router = express.Router();

// // POST /api/users/profiles
// router.post("/profiles", async (req, res) => {
//   const { ids } = req.body;

//   try {
//     const users = await User.find(
//       { _id: { $in: ids } },
//       "_id name profilePic"
//     );
//     res.json(users);
//   } catch (err) {
//     console.error("Error fetching profiles:", err);
//     res.status(500).json({ message: "Failed to fetch user profiles" });
//   }
// });

// export default router;

import express from "express";
import Artist from "../../models/Artist.model.js";
import Client from "../../models/ClientProfile.model.js";

const router = express.Router();

// POST /api/users/profiles
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

    // Combine and remove duplicates (if any)
    // const users = [...artists];
    const users = [...artists, ...clients];

    res.json(users);
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).json({ message: "Failed to fetch user profiles" });
  }
});

export default router;

