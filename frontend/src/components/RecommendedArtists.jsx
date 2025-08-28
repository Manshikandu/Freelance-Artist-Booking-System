import React, { useEffect, useState } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { MapPin, Users, Brain, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function RecommendedArtists({ clientId }) {
  const [artists, setArtists] = useState([]);
  const [algorithmInfo, setAlgorithmInfo] = useState(null);
    const user = useUserStore((state) => state.user);

    useEffect(() => {
      if (!user || user.role !== "client" || !clientId) return;

      axios
        .get(`/recommend/${clientId}`)
      .then((res) => {
        setArtists(res.data.recommended);
        setAlgorithmInfo({
          algorithm: res.data.algorithm,
          userBookings: res.data.userBookings,
          isNewUser: res.data.isNewUser
        });
      })
      .catch(console.error);
  }, [clientId, user]);

  const getAlgorithmIcon = (algorithm) => {
    switch (algorithm) {
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'for-you':
        return <Brain className="w-4 h-4" />;
      case 'smart-picks':
        return <Users className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getAlgorithmBadge = (algorithm) => {
    const colors = {
      trending: 'bg-orange-100 text-orange-800 border-orange-200',
      'for-you': 'bg-blue-100 text-blue-800 border-blue-200',
      'smart-picks': 'bg-purple-100 text-purple-800 border-purple-200'
    };

    const labels = {
      trending: 'Trending',
      'for-you': 'For You',
      'smart-picks': 'Smart Pick'
    };
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${colors[algorithm] || colors['for-you']}`}>
        <span>{labels[algorithm] || 'For You'}</span>
      </div>
    );
  };

  if (!user || user.role !== "client") return null;

  return (
    <section className="px-6 md:px-22 py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Recommended Artists For You
        </h2>
        
      </div>

      {artists.length === 0 ? (
        <p className="text-center text-gray-500">No recommendations yet.</p>
      ) : (
        <div
          className="flex space-x-6 overflow-x-auto pb-4"
          style={{ scrollbarWidth: "none" }}
        >
          {artists.slice(0, 10).map((artist) => (
            <div
              key={artist._id}
              className="flex-shrink-0 w-[500px] bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-300 overflow-hidden flex cursor-pointer"
            >

              <img
                src={artist.profilePicture?.url || "/default.jpg"}
                alt={artist.username}
                className="w-50 h-auto object-cover rounded-l-2xl"
                style={{ minHeight: "250px" }}
              />

              <div className="flex flex-col justify-between p-6 flex-grow">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {artist.username}
                    </h3>
                    <div className="flex flex-col gap-1">
                      {getAlgorithmBadge(artist.algorithm)}
                      {artist.recommendationScore && (
                        <div className="text-xs text-gray-500 text-right">
                          Score: {artist.recommendationScore.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {artist.reason && (
                    <p className="text-xs text-gray-500 mb-2 italic">
                      {artist.reason}
                    </p>
                  )}
                  
                  <div className="flex items-center text-gray-600 text-sm gap-4 mb-3">
                    <span className="capitalize font-medium">{artist.category}</span>
                    {artist.genres?.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-w-[320px]">
                        {artist.genres.slice(0, 3).map((genre, index) => (
                          <span
                            key={index}
                            className="text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full whitespace-nowrap"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600 text-sm gap-4">
                    <span className="font-semibold">
                      Rs. {artist.wage || "Not specified"} /hr
                    </span>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{artist.location?.city || "Unknown"}</span>
                    </div>
                  </div>
                  {artist.totalRatings > 0 ? (
                    <div className="flex items-center gap-2 text-yellow-500 text-sm font-medium mb-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(artist.weightedRating) ? "fill-yellow-400" : "fill-gray-300"}`}
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.463a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.538 1.118l-3.388-2.462a1 1 0 00-1.175 0L5.213 17.06c-.783.57-1.838-.196-1.538-1.118l1.287-3.966a1 1 0 00-.364-1.118L1.21 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-gray-700">
                        {artist.weightedRating.toFixed(1)} ({artist.totalRatings})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No ratings yet</span>
                  )}
                </div>

                <Link
                  to={`/artist/${artist._id}`}
                  className="mt-6 inline-block bg-purple-900 hover:bg-purple-400 text-white py-2 px-6 rounded-lg text-sm font-medium text-center transition-colors duration-200"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
