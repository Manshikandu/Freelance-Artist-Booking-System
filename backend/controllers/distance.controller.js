// distanceController.js
import fetch from "node-fetch";
import { haversine } from "../utils/haversine.js";
import dotenv from "dotenv";
dotenv.config();

export const calculateDistance = (req, res) => {
  const { lat1, lon1, lat2, lon2 } = req.body;

  if (
    typeof lat1 !== "number" ||
    typeof lon1 !== "number" ||
    typeof lat2 !== "number" ||
    typeof lon2 !== "number"
  ) {
    return res.status(400).json({ message: "Invalid coordinates" });
  }

  const distance = haversine(lat1, lon1, lat2, lon2);
  res.json({ distance });
};


export const getRoute = async (req, res) => {
  const { userLocation, bookingLocation } = req.body;
  if (
    !Array.isArray(userLocation) ||
    !Array.isArray(bookingLocation) ||
    userLocation.length !== 2 ||
    bookingLocation.length !== 2
  ) {
    return res.status(400).json({ message: "Invalid coordinates" });
  }

  try {
    console.log("Making request to ORS with key:", process.env.ORS_API_KEY);
    const orsRes = await fetch("https://api.openrouteservice.org/v2/directions/foot-walking/geojson", {
      method: "POST",
      headers: {
        Authorization: process.env.ORS_API_KEY, // NOT VITE_ORS_API_KEY
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [userLocation[1], userLocation[0]],
          [bookingLocation[1], bookingLocation[0]],
        ],
      }),
    });

    if (!orsRes.ok) {
      return res.status(orsRes.status).json({ message: "ORS error" });
    }
    if (!process.env.ORS_API_KEY) {
  console.error("❌ ORS_API_KEY is not defined in .env");
}


    const data = await orsRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
