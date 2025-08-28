import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import toast from "react-hot-toast";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const defaultPosition = { lat: 27.7172, lng: 85.3240 }; // Kathmandu fallback

const ChangeMapView = ({ center }) => {
  const map = useMap();
  if (center) map.setView(center);
  return null;
};

const MapPicker = ({ value, onChange }) => {
  const [position, setPosition] = useState(value || null);
  const [mapCenter, setMapCenter] = useState(value || defaultPosition);
  const [searchInput, setSearchInput] = useState("");
  const [confirmedPosition, setConfirmedPosition] = useState(null);

 useEffect(() => {
  if (value) {
    setPosition(value);
    setMapCenter(value);
    setSearchInput(`${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setMapCenter(coords);
        setSearchInput(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
      },
      () => {
        setPosition(defaultPosition);
        setMapCenter(defaultPosition);
        setSearchInput(`${defaultPosition.lat}, ${defaultPosition.lng}`);
      }
    );
  }
}, [value]);

useEffect(() => {
  if (value) {
    setConfirmedPosition(value);
  } else {
    setConfirmedPosition(null);
  }
}, [value]);


  const searchLocation = async () => {
    if (!searchInput) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const loc = data[0];
        const newPos = { lat: parseFloat(loc.lat), lng: parseFloat(loc.lon) };
        setPosition(newPos);
        setMapCenter(newPos);
      } else {
        toast.error("Location not found");
      }
    } catch (err) {
      console.error("Error searching location:", err);
      toast.error("Error searching location");
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setSearchInput(data.display_name);
      } else {
        setSearchInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch {
      setSearchInput(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  };

  const handleMapClick = async (latlng) => {
    setPosition(latlng);
    setMapCenter(latlng);
    await reverseGeocode(latlng.lat, latlng.lng);
  };

  const handleSetLocation = () => {
    if (!position) {
      toast.error("Please select a location first");
      return;
    }
    setConfirmedPosition(position);
    onChange(position);
    toast.success("Location set successfully");
  };

  const goToCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setMapCenter(coords);
        await reverseGeocode(coords.lat, coords.lng);
        toast.success("Moved to your current location");
      },
      () => {
        toast.error("Unable to retrieve your location");
      }
    );
  };

  const LocationMarkerWithClick = () => {
    useMapEvents({
      click: (e) => handleMapClick(e.latlng),
    });
    return position ? <Marker position={position} icon={markerIcon} /> : null;
  };

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          placeholder="Search location"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border p-1 flex-grow"
        />
        <button onClick={searchLocation} className="bg-blue-500 text-white px-3 rounded">
          Search
        </button>
        <button
          onClick={handleSetLocation}
          className="bg-green-600 text-white px-3 rounded"
          disabled={!position}
        >
          Set
        </button>
      </div>

      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ChangeMapView center={mapCenter} />
        <LocationMarkerWithClick />
      </MapContainer>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={goToCurrentLocation}
            className="bg-gray-700 text-white px-2 rounded"
            title="Go to Current Location"
          >
            📍
          </button>

          {confirmedPosition && (
            <p>
              <b>Location Set:</b> {confirmedPosition.lat.toFixed(5)}, {confirmedPosition.lng.toFixed(5)}
            </p>
          )}
        </div>

    </div>
  );
};

export default MapPicker;
