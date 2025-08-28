
import { useEffect, useState } from "react";
import axios from "../../lib/axios";

const ArtistList = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admin/Artists-detail");
        setArtists(res.data);
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  if (loading) return <p className="p-6 text-lg">Loading artists...</p>;

  return (
    <div className="pl-60 pr-6 pt-6 pb-10 min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Artist Directory</h2>
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden text-white">
            <thead className="bg-gray-700 text-sm">
              <tr>
                <th className="p-3 text-left">Username</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Location</th>
                <th className="p-3 text-left">Email</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr
                  key={artist.id}
                  className="bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
                >
                  <td className="p-3">{artist.username}</td>
                  <td className="p-3 capitalize">{artist.category}</td>
                  <td className="p-3">{artist.location?.city || "N/A"}</td>
                  <td className="p-3">{artist.email}</td>
                </tr>
              ))}
              {artists.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-300">
                    No artists found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArtistList;
