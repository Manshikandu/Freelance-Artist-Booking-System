//filter ko lai
import { useState } from "react";

const tagOptions = [
  "Musician", "DJ", "Singer", "Dancer",
  "Pop", "Rock", "Hip-Hop", "90s",
  "Solo", "Band",
  "English", "Nepali", "Amharic",
  "Wedding", "Corporate", "Concert"
];

const ArtistFilterForm = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    maxBudget: "",
    preferences: [],
  });

  const [location, setLocation] = useState({ lat: null, lng: null });

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  };

  const handleTagChange = (tag) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(tag)
        ? prev.preferences.filter(t => t !== tag)
        : [...prev.preferences, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng) return alert("Location not set!");
    onSearch({ ...formData, ...location });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow-md">
      <button type="button" onClick={handleLocation} className="bg-blue-500 text-white px-3 py-1 rounded">
        Use My Location
      </button>
      <input
        type="number"
        placeholder="Max Budget (Rs/hr)"
        className="w-full border px-2 py-1"
        value={formData.maxBudget}
        onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
      />

      <div className="grid grid-cols-3 gap-2">
        {tagOptions.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagChange(tag)}
            className={`px-2 py-1 border rounded text-sm ${
              formData.preferences.includes(tag) ? 'bg-purple-500 text-white' : ''
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <button type="submit" className="bg-purple-600 text-white w-full py-2 rounded">
        Search Artists
      </button>
    </form>
  );
};

export default ArtistFilterForm;
