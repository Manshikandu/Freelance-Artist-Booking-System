

import { useState } from "react";
import ArtistFilterForm from "./ArtistFilterForm";
import StarRating from "./StarRating";

const ArtistResults = () => {

const getMatchLevel = (score) => {
  if (score >= 0.85) return "Excellent Match";
  if (score >= 0.7) return "Good Match";
  if (score >= 0.5) return "Average Match";
  return "Low Match";
};

  const [results, setResults] = useState([]);

  const handleSearch = async (filterData) => {
    const res = await fetch("/api/match-artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filterData)
    });
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Find Artists</h2>
      <ArtistFilterForm onSearch={handleSearch} />
      <div className="mt-6">
        {results.length === 0 ? (
          <p>No results yet. Try searching.</p>
        ) : (
          results.map((artist) => (
            < div key={artist._id} className="border-b py-4">
              <h3 className="text-lg font-semibold">{artist.name}</h3>

              {/* //matchlevel */}
               <span className="text-sm font-medium text-green-600">
          {getMatchLevel(artist.score)}
        </span>

        <StarRating score={artist.score} />
      
        

              <p>Distance: {artist.distance} km</p>
              <p>Rate: Rs. {artist.ratePerHour}/hr</p>
            </div>
          ))
        )}
      </div>
    </div>
    
  );
};

export default ArtistResults;
