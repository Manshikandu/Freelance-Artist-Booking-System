
import React, { useState } from "react";
import { BookCard, BookCardContent } from "../components/ui/BookCard";
import { Button } from "../components/ui/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const JobPostForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date(),
    time: new Date(),
    location: {
      city: "",
      state: "",
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
      const response = await fetch("http://localhost:3000/api/jobposts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to post job");

      toast.success("Job posted successfully!");
      navigate("/posts"); // ✅ Redirect to client posts page
    } catch (err) {
      console.error(err);
      toast.error("Failed to post job");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 md:px-40 bg-gray-50 py-10">
      <BookCard className="w-full max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Post a Job</h2>

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
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1">Time</label>
                <DatePicker
                  selected={formData.time}
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
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1">State</label>
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
                        ? "bg-blue-500 text-white border-blue-500"
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
            <Button type="submit">Submit Job</Button>
          </div>
        </form>
      </BookCard>

      {/* Illustration */}
      <div className="hidden md:flex justify-center items-center md:ml-10">
        <img
          src="/src/assets/book.png"
          alt="Artist Booking"
          className="w-[300px] lg:w-[400px] object-contain"
        />
      </div>
    </div>
  );
};

export default JobPostForm;

