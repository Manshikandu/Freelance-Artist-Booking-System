
import React, { useState } from "react";
import { BookCard, BookCardContent } from "../components/ui/BookCard";
import { Button } from "../components/ui/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import img from "../assets/create.jpg"; // Assuming you have an image at this path

const cityOptions = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara"];

const CreatePostPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasPosts = location.state?.hasPosts ?? true;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: new Date(),
    location: {
      city: "",
      Area: "",
      country: "Nepal",
    },
    budget: "",
    artistType: [],
  });

  const artistOptions = ["Musician", "Singer", "Dancer", "DJ", "MC", "Other"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("location.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArtistToggle = (type) => {
    setFormData((prev) => {
      const isSelected = prev.artistType.includes(type);
      const updated = isSelected
        ? prev.artistType.filter((t) => t !== type)
        : [...prev.artistType, type];
      return { ...prev, artistType: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/jobposts", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Job Posted Successfully!");
      setFormData({
        title: "",
        description: "",
        date: new Date(),
        time: new Date(),
        location: { city: "", state: "", country: "Nepal" },
        budget: "",
        artistType: [],
      });

      navigate("/posts", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error creating job post");
    }
  };

  const handleClose = () => {
    if (hasPosts) {
      navigate("/posts");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 md:px-40 bg-gray-50 py-10">
      {/* Back button outside the container - matching ArtistProfileView style */}
      <button
        onClick={() => navigate("/posts")}
        className="fixed top-4 left-4 flex items-center gap-2 bg-purple-100 text-purple-600 hover:bg-purple-200 shadow-md rounded-md px-3 py-1.5 font-medium transition duration-300 ease-in-out cursor-pointer select-none"
        title="Back to posts"
      >
        <ArrowLeft className="w-8 h-8" />
        Back
      </button>

      <div className="relative w-full max-w-2xl">
        <button
          onClick={handleClose}
          disabled={!hasPosts}
          className={`absolute top-10 right-4 text-3xl font-bold ${
            hasPosts
              ? "cursor-pointer text-gray-700 hover:text-gray-900"
              : "opacity-40 cursor-not-allowed"
          }`}
          aria-label="Close"
        >
          ×
        </button>

        <BookCard className="p-6 mt-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Post</h2>
          <form onSubmit={handleSubmit}>
            <BookCardContent className="space-y-4">
              <div>
                <label className="block mb-1">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="E.g., Live DJ for event"
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border p-2 rounded"
                  placeholder="Describe the event or job..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">Date</label>
                  <DatePicker
                    selected={formData.date}
                    onChange={(date) => setFormData({ ...formData, date })}
                    dateFormat="P"
                    minDate={new Date()}
                    className="w-full border p-2 rounded"
                  />
                </div>
                {/* <div className="flex-1">
                  <label className="block mb-1">Time</label>
                  <DatePicker
                    selected={new Date(`1970-01-01T${formData.time}`)}
                    onChange={(time) => {
                      const formatted = time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      setFormData({ ...formData, time: formatted });
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    dateFormat="h:mm aa"
                    className="w-full border p-2 rounded"
                  />
                </div> */}
                <div className="flex-1">
              <label className="block mb-1">Time</label>
              <DatePicker
                selected={formData.time} // ✅ use time directly as a Date object
                onChange={(time) => setFormData({ ...formData, time })}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                dateFormat="h:mm aa"
                className="w-full border p-2 rounded"
              />
            </div>

              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block mb-1">City</label>
                  <select
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">Select a city</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block mb-1">Location</label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Budget (NPR)</label>
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block mb-2">Required Artist Type</label>
                <div className="flex flex-wrap gap-2">
                  {artistOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleArtistToggle(type)}
                      className={`px-3 py-1 rounded-full border ${
                        formData.artistType.includes(type)
                          ? "bg-[#3ee6e6] text-white border-[#3ee6e6]"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </BookCardContent>

            <div className="mt-6 text-center">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </BookCard>
      </div>

      <div className="hidden md:flex justify-center items-center md:ml-10">
        <img
          src={img}
          alt="Artist Booking"
          className="w-[300px] lg:w-[400px] object-contain"
        />
      </div>
    </div>
  );
};

export default CreatePostPage;
