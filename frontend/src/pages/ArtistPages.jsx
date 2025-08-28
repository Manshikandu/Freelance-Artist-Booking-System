
import React, { useState, useEffect, useRef } from "react";
import { useUserStore } from "../stores/useUserStore";
import { Link, useLocation } from "react-router-dom";
import ArtistNavbar from "./Artist/ArtistNavbar";
import BookedDatesCalendar from "../components/BookedDatesCalendar";
import ReviewsSection from "../components/ReviewsSection";
import {ArrowLeft, MapPin, Calendar, BookOpen, Music, Globe, CalendarCog } from "lucide-react";

const ArtistProfilee = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const artist = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const location = useLocation();

  const [activeSection, setActiveSection] = useState("bio");
  const bioRef = useRef(null);
  const mediaRef = useRef(null);
  const reviewsRef = useRef(null);

  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const fetchUpdatedUser = async () => {
      if (!artist?._id) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/api/artist/profile/${artist._id}`);
        if (!res.ok) throw new Error("Failed to fetch artist");
        const data = await res.json();
        setUser(data.artist || data);
      } catch (err) {
        console.error("Failed to fetch artist:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBookedSlots = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/bookings/artist/${artist._id}/booked-slots`);
        const data = await res.json();
        setBookedSlots(data.bookedSlots || []);
      } catch (err) {
        console.error("Error fetching slots:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/reviews/artist/${artist._id}`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        setReviews(data || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    if (artist?._id) {
      fetchUpdatedUser();
      fetchBookedSlots();
      fetchReviews();
    }
  }, [artist?._id, location.key]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = 160;
      const bioTop = bioRef.current?.getBoundingClientRect().top || 0;
      const mediaTop = mediaRef.current?.getBoundingClientRect().top || 0;
      const reviewsTop = reviewsRef.current?.getBoundingClientRect().top || 0;

      if (reviewsTop - offset <= 0) setActiveSection("reviews");
      else if (mediaTop - offset <= 0) setActiveSection("media");
      else setActiveSection("bio");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-purple-700 font-semibold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return <div className="text-center py-10">Please log in to view your profile.</div>;
  }

  return (
    <>
      <ArtistNavbar active="profile" />
      <div className="pt-24 min-h-screen bg-gradient-to-br from-purple-200 to-purple-100 p-4">
        <div className="max-w-6xl mx-auto flex gap-5 bg-white rounded-xl shadow-md p-5">
          {/* Sidebar */}
          <div className="w-1/4 sticky top-24 h-max">
            <div className="bg-purple-50 rounded-xl p-4 shadow-sm space-y-4">
              <div className="text-center">
                <img
                  src={artist.profilePicture?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                  alt="profile"
                  className="w-24 h-24 rounded-full object-cover bg-gray-300 mx-auto"
                />
                <h1 className="text-xl font-bold mt-2">{artist.username}</h1>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="bg-rose-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  {artist.category}
                </span>
                {artist.specialties?.map((s, i) => (
                  <span key={i} className="bg-rose-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {s}
                  </span>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 mt-4">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-purple-600">Schedule</span>
                </div>
                <BookedDatesCalendar
                  bookedSlots={bookedSlots}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  inline
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-3/4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-700">Artist Profile</h2>
              <Link to="/editartist">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                  Edit Profile
                </button>
              </Link>
            </div>

            <div className="border-b pb-2 flex gap-6 font-semibold text-purple-700 top-20 bg-white z-10">
              <button
                onClick={() => scrollToRef(bioRef)}
                className={`hover:text-purple-900 ${activeSection === "bio" ? "border-b-2 border-purple-600" : ""}`}
              >
                Bio
              </button>
              <button
                onClick={() => scrollToRef(mediaRef)}
                className={`hover:text-purple-900 ${activeSection === "media" ? "border-b-2 border-purple-600" : ""}`}
              >
                Media
              </button>
              <button
                onClick={() => scrollToRef(reviewsRef)}
                className={`hover:text-purple-900 ${activeSection === "reviews" ? "border-b-2 border-purple-600" : ""}`}
              >
                Reviews
              </button>
            </div>

            <div className="mt-6 space-y-10">
              {/* Bio */}
              <div ref={bioRef} className="scroll-mt-28">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Bio</h3>
                <p className="text-gray-700 text-sm mb-4">
                  {artist.bio || "This artist has not written a bio yet."}
                </p>

                <div className="space-y-4 text-sm text-gray-700">
                  <div>
                    <p className="flex items-center font-medium gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" /> Location:</p>
                    <p>{artist.location?.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-medium"> Rate:</p>
                    <p>Rs {artist.wage || "N/A"} /hr</p>
                  </div>
                  <div>
                    <p className="font-medium"> Portfolio:</p>
                    {artist.portfolioLink?.length > 0 ? (
                      artist.portfolioLink.map((p, i) => (
                        <div key={i}>
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-words"
                          >
                            {p.url.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </div>

                  {artist.genres?.length > 0 && (
                    <div>
                     <p className="text-gray-600 text-sm flex items-center gap-2"> 
                      <Music className="w-4 h-4 font-medium" /> Genres:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {artist.genres.map((g, i) => (
                          <span key={i} className="bg-rose-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {artist.eventTypes?.length > 0 && (
                    <div>
                      <p className="text-gray-600 text-sm flex items-center gap-2"> 
                      <CalendarCog className="w-4 h-4 font-medium" /> Event Types:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {artist.eventTypes.map((e, i) => (
                          <span key={i} className="bg-rose-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {artist.languages?.length > 0 && (
                    <div>
                      <p className="text-gray-600 text-sm flex items-center gap-2"> 
                      <Globe className="w-4 h-4 font-medium" /> Languages:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {artist.languages.map((l, i) => (
                          <span key={i} className="bg-rose-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Media */}
              <div ref={mediaRef} className="scroll-mt-28">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Media</h3>
                {artist.media?.some((item) => item?.type === "video") && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Videos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {artist.media
                        .filter((item) => item.type === "video")
                        .map((video, i) => (
                          <video
                            key={i}
                            src={video.url}
                            controls
                            className="rounded-xl w-full max-h-60 object-cover shadow-md"
                          />
                        ))}
                    </div>
                  </div>
                )}
                {artist.media?.some((item) => item?.type === "image") ? (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-1">Images</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {artist.media
                        .filter((item) => item.type === "image")
                        .map((image, i) => (
                          <img
                            key={i}
                            src={image.url}
                            alt={`media-${i}`}
                            className="rounded-xl w-full h-40 object-cover shadow-md"
                          />
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No images uploaded yet.</div>
                )}
              </div>

              {/* Reviews */}
              <div ref={reviewsRef} className="scroll-mt-28">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Reviews</h3>
                <ReviewsSection reviews={reviews} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArtistProfilee;
