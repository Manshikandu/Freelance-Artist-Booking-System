// routes/geocode.js
import express from "express";
import fetch from "node-fetch"; // or use global fetch if using Node 18+

const router = express.Router();

router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Missing query parameter `q`" });
  }

  try {
   const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=np&q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "YourAppName/1.0 (your@email.com)", // Required!
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch location data" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Geocoding error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
