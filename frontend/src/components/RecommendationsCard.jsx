

const RecommendationCard = ({ post, onApply, appliedAt, disabled, badge }) => {
  const formatLocation = (location) => {
    if (!location || typeof location !== "object") return "Not specified";
    const { city, state, country } = location;
    return [city, state, country].filter(Boolean).join(", ") || "Not specified";
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all relative">
      {badge && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {badge}
        </div>
      )}

      <h3 className="text-xl font-semibold text-purple-800 mb-2">{post.title}</h3>

      <p className="text-gray-600 mb-1">
        <strong>Category:</strong> {post.category || "N/A"}
      </p>

      {post.genres && post.genres.length > 0 && (
        <p className="text-gray-600 mb-1">
          <strong>Genres:</strong> {post.genres.join(", ")}
        </p>
      )}

      <p className="text-gray-600 mb-1">
        <strong>Location:</strong> {formatLocation(post.location)}
      </p>

      {post.deadline && (
        <p className="text-gray-600 mb-1">
          <strong>Deadline:</strong> {new Date(post.deadline).toLocaleDateString()}
        </p>
      )}

      <p className="text-gray-600 mb-3">
        <strong>Budget:</strong> {post.budget ? `Rs. ${post.budget}` : "Not specified"}
      </p>

      <p className="text-gray-700 line-clamp-3 mb-4">
        {post.description || "No description provided."}
      </p>

      {appliedAt && (
        <p className="text-green-600 mb-2 font-semibold">
          Applied on: {new Date(appliedAt).toLocaleDateString()}
        </p>
      )}

      <button
        onClick={() => onApply(post._id)}
        disabled={disabled}
        className={`px-4 py-2 rounded-lg transition font-semibold ${
          disabled
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        {disabled ? (appliedAt ? "Already Applied" : "Deadline Passed") : "Apply Now"}
      </button>
    </div>
  );
};

export default RecommendationCard;
