
import React, { useState } from "react";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { uploadMedia } from "../components/utlis/UploadMedia";

const GENRE_OPTIONS = ["Pop", "Jazz", "Rock", "Hip-hop", "Classical", "Folk"];
const EVENT_OPTIONS = ["Wedding", "Concert", "Corporate", "Festival", "Private"];
const LANGUAGE_OPTIONS = ["English", "Nepali", "Hindi", "Newari"];
const SPECIALTY_OPTIONS = ["Solo", "Band", "DJ", "Composer"];

export default function EditArtist() {
  const { user: artist, setUser } = useUserStore();
  const navigate = useNavigate();
  const portfolioString = artist?.portfolioLink?.map((p) => p.url).join(", ") || "";

  const [formData, setFormData] = useState({
    username: artist?.username || "",
    location: artist?.location?.city || "",
    category: artist?.category || "",
    portfolio: portfolioString,
    videoUrl: artist?.videoUrl || "",
    bio: artist?.bio || "",
    wage: artist?.wage || 1000,
    genres: artist?.genres || [],
    eventTypes: artist?.eventTypes || [],
    languages: artist?.languages || [],
    specialties: artist?.specialties || []
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMediaUpload = (e) => setMediaFiles([...e.target.files]);
  const handleProfileImageUpload = (e) => setProfileImageFile(e.target.files[0]);

  const getCoordinates = async (city) => {
    try {
      const res = await fetch( `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&countrycodes=np`)
      const data = await res.json();
      if (data.length > 0) return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    } catch (e) {
      console.error("Geocoding failed:", e);
    }
    return [85.3240, 27.7172];
  };

  const saveChanges = async () => {
    try {
      const mediaUrls = [];
      for (const file of mediaFiles) {
        const url = await uploadMedia(file);
        const type = file.type.startsWith("video") ? "video" : "image";
        mediaUrls.push({ url, type });
      }

      let profilePictureUrl = artist?.profilePicture?.url || "";
      if (profileImageFile) profilePictureUrl = await uploadMedia(profileImageFile);

      const loc = {
        type: "Point",
        coordinates: await getCoordinates(formData.location),
        city: formData.location
      };

      const portfolioLink = formData.portfolio.split(",").map((url) => url.trim()).filter(Boolean).map((url) => ({ url, type: "link" }));

      const res = await fetch(`http://localhost:3000/api/artist/profile/${artist._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          location: loc,
          category: formData.category.toLowerCase(),
          bio: formData.bio,
          wage: Number(formData.wage),
          profilePicture: { url: profilePictureUrl },
          portfolioLink,
          media: [...(artist.media || []), ...mediaUrls],
          genres: formData.genres,
          eventTypes: formData.eventTypes,
          languages: formData.languages,
          specialties: formData.specialties
        })
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.details || "Update failed");
      setUser(updated.artist);
      navigate("/profile");
    } catch (e) {
      console.error("Failed to update artist:", e);
      alert("Failed to save changes. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-3xl shadow-md p-6 space-y-6">
          <TagSelector label="Genres" options={GENRE_OPTIONS} selected={formData.genres} onChange={(val) => setFormData({ ...formData, genres: val })} />
          <TagSelector label="Event Types" options={EVENT_OPTIONS} selected={formData.eventTypes} onChange={(val) => setFormData({ ...formData, eventTypes: val })}
/>
          <TagSelector label="Languages" options={LANGUAGE_OPTIONS} selected={formData.languages} onChange={(val) => setFormData({ ...formData, languages: val })} />
          <TagSelector label="Specialties" options={SPECIALTY_OPTIONS} selected={formData.specialties} onChange={(val) => setFormData({ ...formData, specialties: val })} />
        </div>

        {/* Main Form */}
        {/* <div className="lg:col-span-3 bg-white shadow-2xl rounded-3xl p-10 space-y-8">
          <h2 className="text-3xl font-bold text-purple-700 text-center">Edit Artist Profile</h2> */}
          <div className="lg:col-span-3 bg-white shadow-2xl rounded-3xl p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-purple-700">Edit Artist Profile</h2>
            <button onClick={() => navigate("/profile")} className="text-purple-600 hover:underline">Back to Profile</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Name" name="username" value={formData.username} onChange={handleChange} />
            <Input label="Location" name="location" value={formData.location} onChange={handleChange} />

            <div>
              <label className="block font-medium text-sm mb-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-purple-300">
                <option value="">Select Category</option>
                {["dj", "musician", "mc", "dancer", "singer", "other"].map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <Input label="Portfolio URLs" name="portfolio" value={formData.portfolio} onChange={handleChange} />
            <Input label="Rate (wage)" name="wage" type="number" value={formData.wage} onChange={handleChange} />
            <Input label="Video URL" name="videoUrl" value={formData.videoUrl} onChange={handleChange} />

            <FileInput label="Upload Profile Image" onChange={handleProfileImageUpload} preview={profileImageFile ? URL.createObjectURL(profileImageFile) : artist?.profilePicture?.url} />
            <FileInput label="Upload Media" onChange={handleMediaUpload} multiple accept="image/*,video/*" />
          </div>

          <div>
            <label className="block font-medium text-sm mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-purple-300"
            ></textarea>
          </div>

          <button onClick={saveChanges} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition duration-300">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, ...rest }) {
  return (
    <div>
      <label className="block font-medium text-sm mb-1">{label}</label>
      <input {...rest} className="w-full rounded-xl border px-4 py-2 focus:ring-2 focus:ring-purple-300" />
    </div>
  );
}

function FileInput({ label, onChange, multiple = false, accept = "image/*", preview }) {
  return (
    <div>
      <label className="block font-medium text-sm mb-1">{label}</label>
      <input type="file" onChange={onChange} multiple={multiple} accept={accept} className="mb-2" />
      {preview && <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-full" />}
    </div>
  );
}

function TagSelector({ label, options, selected, onChange }) {
  const [custom, setCustom] = useState("");

  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div>
      <label className="block font-medium text-sm mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
              selected.includes(opt) ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-800"
            }`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </button>
        ))}
        <input
          placeholder="Other..."
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) {
              toggle(custom.trim());
              setCustom("");
              e.preventDefault();
            }
          }}
          className="px-3 py-1 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
      </div>
    </div>
  );
}