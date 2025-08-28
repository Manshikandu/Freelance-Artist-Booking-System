// AdminVerifyArtists.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";

export default function AdminVerifyArtists() {
  const [unverifiedArtists, setUnverifiedArtists] = useState([]);

  useEffect(() => {
    fetchUnverifiedArtists();
  }, []);

  const fetchUnverifiedArtists = async () => {
    try {
      const res = await axios.get("/api/admin/unverified-artists");
      setUnverifiedArtists(res.data);
    } catch (err) {
      console.error("Error fetching unverified artists", err);
    }
  };

  const handleVerify = async (id) => {
    try {
      await axios.patch(`/api/verify/verify-artist/${id}`);
      setUnverifiedArtists((prev) => prev.filter((a) => a._id !== id));
      alert("Artist verified successfully!");
    } catch (err) {
      console.error("Error verifying artist", err);
      alert("Error verifying artist.");
    }
  };

  return (
    <div className="ml-60 p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Artist Verifications</h1>
      {unverifiedArtists.length === 0 ? (
        <p>No unverified artists found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unverifiedArtists.map((artist) => (
            <Card key={artist._id} className="p-4">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={artist.profilePicture?.url || "/default-avatar.png"}
                    alt={artist.username}
                    className="w-14 h-14 rounded-full border object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{artist.username}</h2>
                    <p className="text-sm text-gray-600">{artist.email}</p>
                    <p className="text-sm text-gray-600">
                      Citizenship No: {artist.citizenshipNumber}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-2 flex-wrap">
                  {artist.citizenshipImage?.url && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Citizenship Image</p>
                      <img
                        src={artist.citizenshipImage.url}
                        alt="Citizenship"
                        className="w-32 h-32 object-cover border rounded"
                      />
                    </div>
                  )}
                  {artist.livePhoto?.url && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Live Photo</p>
                      <img
                        src={artist.livePhoto.url}
                        alt="Live"
                        className="w-32 h-32 object-cover border rounded"
                      />
                    </div>
                  )}
                </div>

                <Button onClick={() => handleVerify(artist._id)} className="mt-4">
                  Verify
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

