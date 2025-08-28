// utils/geolocation.js

export const getCoordinates = async (city) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`
    );
    const data = await res.json();
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      return [lon, lat]; 
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return [85.3240, 27.7172]; 
};
