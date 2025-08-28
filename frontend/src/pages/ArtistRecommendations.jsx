
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import RecommendationCard from "../components/RecommendationsCard";
import { toast } from "react-hot-toast";

const ArtistRecommendations = () => {
  const [content, setContent] = useState([]);
  const [collab, setCollab] = useState([]);
  const [appliedPosts, setAppliedPosts] = useState({}); // {postId: appliedAt}

  const fetchAppliedPosts = async () => {
    try {
      const res = await axios.get("/jobposts/applied", { withCredentials: true });
      const appliedMap = {};
      res.data.forEach(({ jobPostId, appliedAt }) => {
        appliedMap[jobPostId._id] = appliedAt;
      });
      setAppliedPosts(appliedMap);
    } catch {
      toast.error("Failed to fetch applied posts");
    }
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const [contentRes, collabRes] = await Promise.all([
          axios.get("/recommendations/content", { withCredentials: true }),
          axios.get("/recommendations/collaborative", { withCredentials: true }),
        ]);
        setContent(contentRes.data);
        setCollab(collabRes.data);
      } catch {
        toast.error("Failed to fetch recommendations");
      }
    };

    fetchRecommendations();
    fetchAppliedPosts();
  }, []);

  const handleApply = async (postId) => {
    try {
      await axios.post(`/jobposts/${postId}/apply`, {}, { withCredentials: true });
      toast.success("Applied successfully!");
      setAppliedPosts((prev) => ({ ...prev, [postId]: new Date().toISOString() }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-purple-700 mb-4">
        Recommended for You (Content-Based)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.map((post) => (
          <RecommendationCard
            key={post._id}
            post={post}
            onApply={handleApply}
            appliedAt={appliedPosts[post._id]}
            disabled={appliedPosts[post._id] || (post.deadline && new Date(post.deadline) < new Date())}
            badge={post.score && post.score > 0.6 ? "Top Match" : "Recommended"} 
          />
        ))}
      </div>

      <h2 className="text-xl font-bold text-purple-700 mt-8 mb-4">
        People like you also applied to (Collaborative)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collab.map((post) => (
          <RecommendationCard
            key={post._id}
            post={post}
            onApply={handleApply}
            appliedAt={appliedPosts[post._id]}
            disabled={appliedPosts[post._id] || (post.deadline && new Date(post.deadline) < new Date())}
            badge={post.score && post.score > 0.6 ? "Top Match" : "Recommended"}
          />
        ))}
      </div>
    </div>
  );
};

export default ArtistRecommendations;
