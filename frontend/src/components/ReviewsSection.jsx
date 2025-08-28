
import React, { useState } from "react";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";

function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function StarDisplay({ rating }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= rating ? "#facc15" : "none"}
          stroke="#facc15"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M11.48 3.499l2.36 4.766 5.265.765-3.812 3.72.9 5.246-4.713-2.475-4.713 2.475.9-5.246-3.812-3.72 5.265-.765 2.36-4.766z" />
        </svg>
      ))}
    </div>
  );
}

const ReviewsSection = ({ reviews, globalAvgRating = 3.5 }) => {
  const [sortOption, setSortOption] = useState("recent");
  const [visibleCount, setVisibleCount] = useState(5);

  const m = 10; // Minimum reviews threshold for Bayesian average
  const v = reviews.length;
  const R = v > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / v : 0;
  const weightedRating = v > 0 ? ((v / (v + m)) * R) + ((m / (v + m)) * globalAvgRating) : 0;
  const averageRating = weightedRating.toFixed(1);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortOption === "high") return b.rating - a.rating;
    if (sortOption === "low") return a.rating - b.rating;
    return 0;
  });

  const starCounts = [5, 4, 3, 2, 1].map(
    (star) => reviews.filter((r) => r.rating === star).length
  );

  return (
    <div>
      {reviews.length === 0 ? (
        <p className="text-gray-600 text-sm">No reviews available yet.</p>
      ) : (
        <>
          {/* Summary + Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <StarDisplay rating={Math.round(weightedRating)} />
              <span className="text-sm text-gray-700">
                {averageRating} out of 5 ({reviews.length} reviews)
              </span>
            </div>

            <select
              className="border text-sm px-2 py-1 rounded-md"
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setVisibleCount(5);
              }}
            >
              <option value="recent">Most recent</option>
              <option value="high">Highest rating</option>
              <option value="low">Lowest rating</option>
            </select>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-1 mb-6 max-w-sm">
            {[5, 4, 3, 2, 1].map((star, i) => {
              const count = starCounts[i];
              const percent = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-6">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded h-2 overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {sortedReviews.slice(0, visibleCount).map((review) => (
              <div
                key={review._id}
                className="bg-white p-4 rounded-xl shadow-sm border flex gap-3"
              >
                <img
                  src={
                    review.clientProfile?.profilePicture?.url ||
                    review.clientProfile?.avatar ||
                    review.clientId?.profilePicture?.url ||
                    review.clientId?.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={
                    review.clientProfile?.name ||
                    review.clientId?.username ||
                    "User"
                  }
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div>
                  <p className="text-gray-500 mt-1 font-medium">
                    {review.clientProfile?.name || review.clientId?.username || "Anonymous"}
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <StarDisplay rating={review.rating} />
                    <span className="text-sm text-gray-500">
                      {formatRelativeDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-800 text-sm">{review.reviewText}</p>
                </div>
              </div>
            ))}
          </div>

          {visibleCount < sortedReviews.length && (
            <div className="text-center mt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Show more reviews
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsSection;
