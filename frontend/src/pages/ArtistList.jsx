import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Map, Navigation, List, LayoutGrid, Flame, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import { useUserStore } from "../stores/useUserStore";

const genreOptions = ["Rock", "Jazz", "Pop", "Classical", "Hip-Hop"];
const specialtyOptions = ["Solo", "Band", "DJ", "Composer"];
const languageOptions = ["English", "Nepali", "Hindi"];

const ArtistsList = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [distanceLimit, setDistanceLimit] = useState(20);
  const [maxPrice, setMaxPrice] = useState("");
  const [genres, setGenres] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [sortBy, setSortBy] = useState("match");
  const [view, setView] = useState("grid");
  const [filtersApplied, setFiltersApplied] = useState(false);

  const handleBackToHome = () => {
    if (user?.role === "artist") {
      navigate("/artisthome");
    } else {
      navigate("/");
    }
  };

  const fetchCoordinates = async (query) => {
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data?.[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchSuggestions = debounce(async (val) => {
    if (!val) return setSuggestions([]);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSuggestions(data.map((d) => d.display_name));
    } catch {
      setSuggestions([]);
    }
  }, 400);

  const handleLocationInput = (e) => {
    const val = e.target.value;
    setLocation(val);
    fetchSuggestions(val);
    // Auto-update coordinates will happen through the applySuggestion function
  };

  const applySuggestion = async (s) => {
    setLocation(s);
    setSuggestions([]);
    const coords = await fetchCoordinates(s); // fetch lat,lng for selected suggestion
    if (coords) {
      setUserLocation(coords);  // <-- this updates the base location for distance calc
      // Only store if user explicitly selects a suggestion
      localStorage.setItem("manualLocation", s);
      toast.success(`Location set to: ${s}`);
    } else {
      toast.error("Failed to resolve location");
    }
  };

  useEffect(() => {
    const initLocation = async () => {
      // Don't auto-load cached location on page refresh
      // Start fresh each time to avoid persistent location issues
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(coords);
          toast.success("Using your current location");
        },
        () => {
          toast.error("Failed to get location, using default Kathmandu");
          setUserLocation({ lat: 27.7172, lng: 85.324 });
        }
      );
    };

    initLocation();
  }, []);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { lat: userLat, lng: userLng } = userLocation;

      const res = await fetch("/api/match-artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userLat,
          userLng,
          distanceLimit,
          maxBudget: maxPrice ? parseInt(maxPrice) : null,
          categoryName: categoryName?.toLowerCase(),
          preferences: { genres, specialties, languages },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to fetch artists: ${res.status}`);
      }

      let data = await res.json();

      

      if (sortBy === "price") {
        data.sort((a, b) => (a.wage || a.ratePerHour || 0) - (b.wage || b.ratePerHour || 0));
      } else if (sortBy === "distance") {
        data.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      } else {
        
        if (maxPrice) {
          const budget = parseInt(maxPrice);
          data.sort((a, b) => {
            const aPrice = a.wage || a.ratePerHour || 0;
            const bPrice = b.wage || b.ratePerHour || 0;
            
           
            const aPriceDiff = Math.abs(aPrice - budget);
            const bPriceDiff = Math.abs(bPrice - budget);
            
           
            if (aPrice <= budget && bPrice <= budget) {
              return aPriceDiff - bPriceDiff;
            }
            
           
            if (aPrice <= budget && bPrice > budget) return -1;
            if (bPrice <= budget && aPrice > budget) return 1;
          
            return b.score - a.score;
          });
        } else {
         
          data.sort((a, b) => b.score - a.score);
        }
      }

      if (
        data.length === 0 &&
        (maxPrice || genres.length || specialties.length || languages.length || location)
      ) {
        toast.error("No artists found matching your filters.");
      }

      setArtists(data);
      setFiltersApplied(
        !!maxPrice || genres.length || specialties.length || languages.length || location
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [userLocation, distanceLimit, maxPrice, categoryName, genres, specialties, languages, sortBy, location]);

  useEffect(() => {
    if (userLocation.lat && userLocation.lng) {
      const debouncedFetch = debounce(fetchArtists, 500);
      debouncedFetch();
      return () => debouncedFetch.cancel();
    }
  }, [categoryName, location, genres, specialties, languages, maxPrice, sortBy, userLocation, distanceLimit, fetchArtists]);

  const toggle = (val, arr, setArr) =>
   setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const clear = () => {
    setLocation("");
    setMaxPrice("");
    setGenres([]);
    setSpecialties([]);
    setLanguages([]);
    setSortBy("match");
    setFiltersApplied(false);
    setSuggestions([]);
    
    localStorage.removeItem("manualLocation");
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Reset to your current location");
      },
      () => {
       
        setUserLocation({ lat: 27.7172, lng: 85.324 });
        toast.info("Reset to default location (Kathmandu)");
      }
    );
  };

  const colorMap = {
    indigo: "bg-indigo-600 text-white border-indigo-700",
    green: "bg-green-600 text-white border-green-700",
    rose: "bg-pink-600 text-white border-rose-700",
  };

  const renderBadgeOptions = (label, options, selected, setSelected, color) => (
    <div className="mb-4">
      <span className="font-medium block mb-1">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt, selected, setSelected)}
            className={`text-xs px-3 py-1 rounded-full border transition duration-150 whitespace-nowrap ${
              selected.includes(opt)
                ? colorMap[color] || "bg-gray-600 text-white border-gray-700"
                : "bg-gray-100 text-gray-800 border-gray-300"
            }`}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const getMatchLabel = (score) => {
    if (!filtersApplied) return null;
    if (score >= 0.9) return <span className="flex items-center gap-1 text-red-600 text-xs"><Flame size={14} />Best Match</span>;
    if (score >= 0.75) return <span className="text-blue-600 text-xs">Excellent Match</span>;
    if (score >= 0.5) return <span className="text-green-600 text-xs">Good Match</span>;
    return null;
  };

  return (
    <div className="min-h-screen py-12 px-4 max-w-7xl mx-auto">
      <button
        onClick={handleBackToHome}
        className="fixed top-4 left-4 flex items-center gap-2 bg-purple-100 text-purple-600 hover:bg-purple-200 shadow-md rounded-md px-3 py-1.5 font-medium transition duration-300 ease-in-out cursor-pointer select-none z-50"
        title="Back to homepage"
      >
        <ArrowLeft className="w-5 h-5" />
        Back 
      </button>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold capitalize">{categoryName || "All Artists"}</h2>
        <button
          onClick={() => setView(view === "grid" ? "list" : "grid")}
          className="flex items-center gap-2 text-sm px-3 py-1 border rounded"
        >
          {view === "grid" ? <List size={16} /> : <LayoutGrid size={16} />} View
        </button>
      </div>

      <div className="flex gap-8">
        <aside className="w-72 bg-white p-6 rounded shadow max-h-full">
          <h3 className="text-xl font-semibold mb-4">Filters</h3>

          <div className="mb-4 relative">
            <label htmlFor="locationInput" className="block font-medium mb-1">Enter Location</label>
            <input
              id="locationInput"
              type="text"
              value={location}
              onChange={handleLocationInput}
              placeholder="e.g. Sanepa, Balkhu"
              className="w-full border px-3 py-2 rounded"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded mt-1 w-full max-h-40 overflow-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => applySuggestion(s)}
                    className="px-3 py-1 hover:bg-gray-200 cursor-pointer text-sm"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Distance Limit: {distanceLimit} km</label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={distanceLimit}
              onChange={(e) => setDistanceLimit(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {renderBadgeOptions("Genres", genreOptions, genres, setGenres, "indigo")}
          {renderBadgeOptions("Specialties", specialtyOptions, specialties, setSpecialties, "green")}
          {renderBadgeOptions("Languages", languageOptions, languages, setLanguages, "rose")}

          <div className="mb-4">
            <label htmlFor="maxBudget" className="font-medium block mb-1">Max Budget (Rs/hr)</label>
            <input
              id="maxBudget"
              type="number"
              min="1"
              value={maxPrice}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setMaxPrice(isNaN(val) || val <= 0 ? "" : val);
              }}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="sortBy" className="font-medium block mb-1">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="match">Best Match (Smart)</option>
              <option value="price">Lowest to Highest Budget</option>
              <option value="distance">Nearest Distance</option>
            </select>
          </div>

          <button
            onClick={clear}
            className="mt-4 w-full bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </aside>

        <main className="flex-1">
          {loading ? (
            <p className="text-center text-gray-500">Loading artists…</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : artists.length === 0 ? (
            <p className="text-center text-gray-600">No artists found.</p>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {artists.map((artist) => (
                <div
                  key={artist._id}
                  onClick={() => navigate(`/artist/${artist._id}`)}
                  className="cursor-pointer rounded shadow hover:shadow-lg overflow-hidden transition bg-white"
                >
                  <img
                    src={artist.profilePicture?.url || "/profilePic.jpg"}
                    alt={artist.username}
                    className={view === "grid" ? "w-full h-64 object-cover" : "w-full h-48 object-cover"}
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold">{artist.username}</h3>
                    <p className="text-indigo-600 capitalize">{artist.category}</p>
                    <p className="mt-1">Rs {artist.wage || artist.ratePerHour}/hr</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Map size={16} /> {artist.location?.city || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Navigation size={14} /> {artist.distance ? artist.distance.toFixed(2) : "?"} km away
                    </p>
                    {artist.score && getMatchLabel(parseFloat(artist.score)) && (
                      <div className="mt-1">{getMatchLabel(parseFloat(artist.score))}</div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2 text-xs text-gray-600">
                      {(artist.genres || []).map((g) => (
                        <span key={g} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{g}</span>
                      ))}
                      {(artist.specialties || []).map((s) => (
                        <span key={s} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {(artist.languages || []).map((l) => (
                        <span key={l} className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ArtistsList;