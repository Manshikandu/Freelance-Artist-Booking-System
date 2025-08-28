
import express from "express";
import Artist from "../../models/Artist.model.js";

const router = express.Router();

router.get("/unverified-artists", async (req, res) => {
  try {
    const artists = await Artist.find({ isVerified: false });
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unverified artists" });
  }
});

router.patch("/verify-artist/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await Artist.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.json({ message: "Artist verified successfully", artist });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

export default router;