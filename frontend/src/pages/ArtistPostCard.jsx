

const ArtistPostCard = ({ post, onApply, isApplied }) => {
  const clientName = post.client?.name || post.clientName || "Client";
  const clientImage =
  post.client?.avatar || post.clientAvatar || "https://via.placeholder.com/50";


  return (
    <div className="flex flex-col justify-between h-full bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition">
      <div>
        {/* Job Title */}
        <h2 className="text-lg font-semibold text-purple-800 mb-2">{post.title}</h2>

        {/* Client Info */}
        <div className="flex items-center gap-4 mb-4">
          <img
            src={clientImage}
            alt={clientName}
            className="w-10 h-10 rounded-full object-cover border border-purple-200"
          />
          <div>
            <p className="font-medium text-purple-700">{clientName}</p>
            <p className="text-sm text-gray-500">Posted this job</p>
          </div>
        </div>

        {post.artistType && post.artistType.length > 0 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Looking for:</p>
            <div className="flex flex-wrap gap-2">
              {post.artistType.map((type, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Job Description */}
        <p className="text-gray-600 mb-3 line-clamp-3">{post.description}</p>

        {/* Job Details */}
        <div className="text-sm text-gray-500 space-y-1 mb-3">
          <p><strong>Date:</strong> {new Date(post.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> {post.time}</p>
          <p><strong>Location:</strong> {post.location?.city}, {post.location?.state}</p>
          <p><strong>Budget:</strong> ₹{post.budget}</p>
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={() => onApply(post._id)}
        disabled={isApplied}
        className={`mt-4 w-full py-2 rounded-md font-semibold transition ${
          isApplied
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-purple-600 text-white hover:bg-purple-700"
        }`}
      >
        {isApplied ? "Already Applied" : "Apply"}
      </button>
    </div>
  );
};

export default ArtistPostCard;



