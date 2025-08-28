// RecentVerifiedArtist.jsx
//up2
import { useEffect, useState } from "react";
import axios from "../../lib/axios";

const RecentVerifiedArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedArtistId, setExpandedArtistId] = useState(null);

  useEffect(() => {
    const fetchRecentVerifiedArtists = async () => {
      try {
        const res = await axios.get("/admin/recent-verified-artists");
        setArtists(res.data);
      } catch (error) {
        console.error("Failed to fetch recent verified artists", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentVerifiedArtists();
  }, []);

  const toggleDetails = (artistId) => {
    setExpandedArtistId(prevId => (prevId === artistId ? null : artistId));
  };

  if (loading) return <p className="p-6 text-lg">Loading artists...</p>;

  return (
    <div className="ml-64 p-6">
      <h1 className="text-3xl font-bold mb-6">Recently Verified Artists</h1>
      {artists.length === 0 ? (
        <p>No recent verified artists found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-start">

          {artists.map((artist) => {
            const isExpanded = expandedArtistId === artist._id;

            return (
              <div
                key={artist._id}
                className="bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-xl shadow-md"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={artist.profilePicture?.url || "/default-avatar.png"}
                    alt={artist.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white"
                  />
                  <div>
                    <h4 className="text-md font-bold">{artist.username}</h4>
                    <p className="text-sm">{artist.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleDetails(artist._id)}
                  className="mt-3 bg-white text-green-700 font-semibold py-1 px-3 rounded hover:bg-gray-100"
                >
                  {isExpanded ? "Hide Details" : "View Details"}
                </button>

                {isExpanded && (
                  <div className="mt-4 bg-white text-black p-3 rounded-xl shadow-inner space-y-2">
                    <p><strong>Email:</strong> {artist.email}</p>
                    <p><strong>Citizenship No:</strong> {artist.citizenshipNumber}</p>

                    <div className="flex gap-4 flex-wrap">
                      {artist.citizenshipImage?.url && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Citizenship Image</p>
                          <img
                            src={artist.citizenshipImage.url}
                            alt="Citizenship"
                            className="w-32 h-32 object-cover border rounded"
                          />
                        </div>
                      )}
                      {artist.livePhoto?.url && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Live Photo</p>
                          <img
                            src={artist.livePhoto.url}
                            alt="Live"
                            className="w-32 h-32 object-cover border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentVerifiedArtists;
