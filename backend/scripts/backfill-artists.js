// backfill-artists.js
import mongoose from "mongoose";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

import Artist from "../models/Artist.model.js"; // adjust path to your actual model

console.log("MONGO_URI:", process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
  runBackfill();
}).catch((err) => {
  console.error("DB connection error:", err);
});

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function getCoordinates(city) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
    );
    const data = await response.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
  } catch (err) {
    console.error("Geocoding error for city:", city, err);
  }
  return null;
}

async function runBackfill() {
  const artists = await Artist.find({
    $or: [
      { location: { $exists: false } },
      { "location.coordinates": { $exists: false } },
      { "location.coordinates": { $size: 0 } },
    ]
  });

  console.log(`Found ${artists.length} artists to update.`);

  for (const artist of artists) {
    const city = artist.location?.city || artist.city;
    if (!city) continue;

    const coords = await getCoordinates(city);
    if (coords) {
      artist.location = {
        city,
        coordinates: coords,
      };
      await artist.save();
      console.log(`✅ Updated: ${artist._id} (${city})`);
    } else {
      console.warn(`⚠️  Failed to geocode: ${artist._id} (${city})`);
    }

    await sleep(1500); // avoid rate limit
  }

  console.log("Backfill complete.");
  process.exit();
}
