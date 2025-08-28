// backend/utils/geolocation.js

import fetch from "node-fetch"; // Required only if you're on Node <18

export const getCoordinatesFromCity = async (city) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ", Nepal")}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "YourAppName/1.0 (your@email.com)", // Replace this
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch coordinates");
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Location not found");
  }

  const lat = parseFloat(data[0].lat);
  const lon = parseFloat(data[0].lon);

  return { lat, lon };
};
