import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";


import axios from "../lib/axios";

import { toast } from "react-hot-toast";

const ApplyJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");
  const [sampleURL, setSampleURL] = useState("");

  useEffect(() => {
    axios.get(`/apply/${id}`, { withCredentials: true })
      .then(res => setJob(res.data))
      .catch(() => toast.error("Job not found"));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/apply/${id}`, { message, sampleURL }, { withCredentials: true });
      toast.success("Application submitted!");
      navigate("/recommendations");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  if (!job) return <p className="text-center mt-10">Loading job...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">{job.title}</h2>

      <p><strong>Category:</strong> {job.category}</p>
      <p><strong>Budget:</strong> {job.budget || "N/A"}</p>
      <p><strong>Description:</strong> {job.description}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block font-semibold">Optional Message:</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            className="w-full p-2 border rounded-md"
            placeholder="Say something about yourself..."
          />
        </div>
        <div>
          <label className="block font-semibold">Portfolio / Sample URL:</label>
          <input
            type="url"
            value={sampleURL}
            onChange={(e) => setSampleURL(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="https://link-to-sample.com"
          />
        </div>
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Confirm & Submit
        </button>
      </form>
    </div>
  );
};

export default ApplyJob;
