import { useState } from "react";

const ArtistCard = ({ artist }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-4 rounded-xl shadow-md flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <img
          src={artist.profilePicture?.url || "/default-avatar.png"}
          alt={artist.username}
          className="w-14 h-14 rounded-full object-cover border-2 border-white"
        />
        <div>
          <h4 className="text-md font-bold">{artist.username}</h4>
          <p className="text-sm break-all">{artist.email}</p>
        </div>
      </div>

      <button
        onClick={() => setShowDetails((prev) => !prev)}
        className="mt-3 bg-white text-green-700 font-semibold py-1 px-3 rounded hover:bg-gray-100 self-start"
      >
        {showDetails ? "Hide Details" : "View Details"}
      </button>

      {showDetails && (
        <div className="mt-4 bg-white text-black dark:bg-gray-900 dark:text-white p-4 rounded-lg shadow-inner">
          <p>
            <strong>Citizenship No:</strong> {artist.citizenshipNumber}
          </p>

          <div className="flex gap-4 mt-4 flex-wrap">
            {artist.citizenshipImage?.url && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Citizenship Image</p>
                <img
                  src={artist.citizenshipImage.url}
                  alt="Citizenship"
                  className="w-32 h-32 object-cover border rounded"
                />
              </div>
            )}

            {artist.livePhoto?.url && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Live Photo</p>
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
};

export default ArtistCard;
