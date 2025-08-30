// SearchResult.jsx

import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SearchResult = () => {
   const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search).get("query")?.toLowerCase() || "";

  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/api/artist/search?query=${query}`
          );
          setResults(response.data);
          console.log("Search results:", response.data);
        } catch (error) {
          console.error("Error fetching search results:", error);
        }
      };
      fetchResults();
    }
  }, [query]);

  return (
    <div className="p-4">
         <button
              onClick={() => navigate("/")}
              className="fixed top-4 left-4 flex items-center gap-2 bg-purple-100 text-purple-600 hover:bg-purple-200 shadow-md rounded-md px-3 py-1.5 font-medium transition duration-300 ease-in-out cursor-pointer select-none"
              title="Back to artist list"
            >
              <ArrowLeft className="w-8 h-8" />
              Back
            </button>
      <h2 className="text-xl font-bold mb-4 flex justify-center">
        Search Results for "{query}"
      </h2>

      {results.length === 0 ? (
        <p className="text-gray-600">No matching artists found.</p>
      ) : (
        results.map((artist, i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3 px-4 mb-3 border border-purple-300 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
          >
            <img
              src={artist.profilePicture?.url || "/default-profile.png"}
              alt={artist.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
            />

            <div className="flex flex-col">
              <Link
                to={`/artist/${artist._id}`}
                className="font-semibold text-purple-900 text-lg hover:underline"
              >
                {artist.username}
              </Link>

              <div className="mt-1 flex flex-wrap gap-2">
                {artist.category ? (
                  <span className="bg-purple-200 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                    {artist.category}
                  </span>
                ) : (
                  <span className="text-purple-500 italic text-xs">
                    No category
                  </span>
                )}

                {artist.specialities?.length > 0 &&
                  artist.specialities.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-300 text-purple-900 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SearchResult;