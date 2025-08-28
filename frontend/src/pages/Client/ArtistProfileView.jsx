
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  BookOpen,
  Music,
  Globe,
  CalendarCog,
} from "lucide-react";
import { useUserStore } from "../../stores/useUserStore";
import BookedDatesCalendar from "../../components/BookedDatesCalendar";
import ReviewsSection, { StarDisplay } from "../../components/ReviewsSection";
import ChatContainer from "../../ChatApp/components/ChatContainer";
import { useChatStore } from "../../stores/useChatStore";
import { createOrGetConversation } from "../../lib/ChatApi";

const ArtistProfileView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserStore();

  const [artist, setArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [activeSection, setActiveSection] = useState("bio");
  const [showChat, setShowChat] = useState(false);
  const { setSelectedConversation, getMessages, subscribeToMessages, unsubscribeFromMessages, selectedConversation, messages } = useChatStore();

  const bioRef = useRef(null);
  const mediaRef = useRef(null);
  const reviewsRef = useRef(null);
  const messageEndRef = useRef(null);

  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Restore chat from URL param
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldShowChat = searchParams.get("chat") === "true";
    if (shouldShowChat) setShowChat(true);
  }, []);

  // Restore chat conversation if needed
  useEffect(() => {
    const restoreChat = async () => {
      const client = useUserStore.getState().user;
      if (!client || !artist || !showChat) return;
      const currentConversation = useChatStore.getState().selectedConversation;
      if (!currentConversation) {
        const conversation = await createOrGetConversation(
          client._id,
          client.role,
          artist._id,
          artist.role
        );
        useChatStore.getState().setSelectedConversation(conversation);
      }
    };
    restoreChat();
  }, [showChat, artist]);

  const globalAvgRating = allReviews.length > 0 
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
    : 4.0; 

  React.useEffect(() => {
    if (allReviews.length > 0) {
      console.log(` Global Average Calculated: ${globalAvgRating.toFixed(2)} from ${allReviews.length} total reviews`);
    }
  }, [allReviews, globalAvgRating]);

  useEffect(() => {
    if (!id) return;
  
  
    const fetchArtist = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/client/artists/profile/${id}`
        );
        if (!res.ok) throw new Error("Failed to fetch artist data");
        const data = await res.json();
        setArtist(data.artist || data);
      } catch (error) {
        console.error("Error fetching artist:", error);
      }
    };

    const fetchBookedSlots = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/bookings/artist/${id}/booked-slots`
        );
        const data = await res.json();
        if (data.bookedSlots) setBookedSlots(data.bookedSlots);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/reviews/artist/${id}`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    const fetchAllReviews = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/reviews/all`);
        if (!res.ok) {
          console.warn(`Failed to fetch all reviews: ${res.status}`);
          return;
        }
        const data = await res.json();
        setAllReviews(data);
      } catch (error) {
        console.error("Error fetching all reviews for global average:", error);
      }
    };

    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchArtist(),
        fetchBookedSlots(),
        fetchReviews(),
        fetchAllReviews(),
      ]);
      setIsLoading(false);
    };

    fetchAllData();
  }, [id]);

  const formatTime = (time24) => {
    if (!time24) return "";
    const [hourStr, minuteStr] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr || "00";
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const handleOpenChat = async () => {
    const client = useUserStore.getState().user;
    if (!artist) return;
    const conversation = await createOrGetConversation(
      client._id,
      client.role,
      artist._id,
      artist.role
    );
    useChatStore.getState().setSelectedConversation(conversation);
    const url = new URL(window.location.href);
    url.searchParams.set("chat", "true");
    window.history.replaceState(null, "", url.toString());
    setShowChat(true);
  };

  // Fetch messages & subscribe to new messages when chat is shown
  useEffect(() => {
    if (!showChat || !selectedConversation?._id) return;
    getMessages(selectedConversation._id);
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [showChat, selectedConversation?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to bottom on new messages (if you render messages here)
  useEffect(() => {
    if (showChat && messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showChat, messages]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-purple-700 font-semibold">Loading artist profile...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return <div className="text-center py-10">Artist not found.</div>;
  }

  const slotsForSelectedDate = bookedSlots.filter(
    (slot) =>
      new Date(slot.eventDate).toDateString() === selectedDate.toDateString() &&
      ["booked", "accepted"].includes(slot.status)
  );

  // Calculate average rating from reviews
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-purple-100 p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/category/" + (artist?.category || ""))}
        className="fixed top-4 left-4 flex items-center gap-2 bg-purple-100 text-purple-600 hover:bg-purple-200 shadow-md rounded-md px-3 py-1.5 font-medium transition duration-300 ease-in-out cursor-pointer select-none"
        title="Back to artist list"
      >
        <ArrowLeft className="w-8 h-8" />
        Back
      </button>
      <div className="max-w-6xl mx-auto flex gap-5 bg-white rounded-xl shadow-md p-5">
        {/* Sidebar */}
        <aside
          className="w-full sm:w-[280px] flex-shrink-0 sticky top-5 h-max"
          style={{ maxWidth: '100%' }}
        >
          <div className="bg-purple-50 rounded-xl p-4 shadow-sm flex flex-col items-center">
            <div className="text-center w-full">
              <img
                src={
                  artist.profilePicture?.url ||
                  artist.avatar ||
                  'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                }
                alt="profile"
                className="w-24 h-24 rounded-full object-cover bg-gray-300 mx-auto"
              />
              <h1 className="text-xl font-bold mt-2">{artist.username}</h1>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium mt-1 inline-block">
                {artist.category}
              </span>
            </div>
            <div className="w-full flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2 mt-4">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-600">Schedule</span>
              </div>
              <div className="w-full flex justify-center">
                <div className="w-full max-w-xs">
                  <BookedDatesCalendar
                    bookedSlots={bookedSlots}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    inline
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="w-3/4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-purple-700">Artist Profile</h2>
            <Link to={`/book?artistId=${artist._id}`}>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                Book Artist
              </button>
            </Link>
          </div>

          <div className="border-b pb-2 flex gap-6 font-semibold text-purple-700 sticky top-0 bg-white z-10">
            <button
              onClick={() => {
                setShowChat(false);
                setActiveSection("bio");
              }}
              className={`hover:text-purple-900 ${
                activeSection === "bio" && !showChat ? "border-b-2 border-purple-600" : ""
              }`}
            >
              Bio
            </button>
            <button
              onClick={() => {
                setShowChat(false);
                setActiveSection("media");
              }}
              className={`hover:text-purple-900 ${
                activeSection === "media" && !showChat ? "border-b-2 border-purple-600" : ""
              }`}
            >
              Media
            </button>
            <button
              onClick={() => {
                setShowChat(false);
                setActiveSection("reviews");
              }}
              className={`hover:text-purple-900 ${
                activeSection === "reviews" && !showChat ? "border-b-2 border-purple-600" : ""
              }`}
            >
              Reviews
            </button>
            <button
              onClick={handleOpenChat}
              className={`hover:text-purple-900 ${
                showChat ? "border-b-2 border-purple-600" : ""
              }`}
            >
              Chat
            </button>
          </div>

          <div className="mt-6">
            {showChat ? (
              <div className="mt-4 border-t pt-4">
                <ChatContainer />
                <div ref={messageEndRef} />
              </div>
            ) : (
              <>
                {activeSection === "bio" && (
                  <div ref={bioRef} className="scroll-mt-28">
                    <h3 className="text-lg font-semibold mb-2 text-purple-700">Bio</h3>
                    <p className="text-gray-700 text-sm">
                      {artist.bio || "This artist has not written a bio yet."}
                    </p>

                    {artist.genres?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <Music className="w-4 h-4" />
                          Genres
                        </p>
                        <p className="font-medium text-base">{artist.genres.join(", ")}</p>
                      </div>
                    )}

                    {artist.eventTypes?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <CalendarCog className="w-4 h-4" />
                          Event Types
                        </p>
                        <p className="font-medium text-base">{artist.eventTypes.join(", ")}</p>
                      </div>
                    )}

                    {artist.languages?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-gray-600 text-sm flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Languages
                        </p>
                        <p className="font-medium text-base">{artist.languages.join(", ")}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "media" && (
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
                                loading="lazy"
                              />
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">No images uploaded yet.</div>
                    )}
                  </div>
                )}

                {activeSection === "reviews" && (
                  <div ref={reviewsRef} className="scroll-mt-28">
                    <h3 className="text-lg font-semibold mb-2 text-purple-700">Reviews</h3>

                    {reviews.length === 0 ? (
                      <p className="text-gray-600 text-sm">No reviews available yet.</p>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <StarDisplay rating={Math.round(averageRating)} />
                          <span className="text-sm text-gray-700">
                            {averageRating} out of 5 ({reviews.length} reviews)
                          </span>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                          {reviews.slice(0, 5).map((review) => {
                            // Prefer clientProfile (populated from backend), fallback to clientId (User)
                            const profile = review.clientProfile || {};
                            const user = review.clientId || {};
                            const clientImg =
                              profile.profilePicture?.url ||
                              profile.avatar ||
                              user.profilePicture?.url ||
                              user.avatar ||
                              "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                            const clientName = profile.name || user.username || "Anonymous";
                            return (
                              <div
                                key={review._id}
                                className="bg-white p-4 rounded-xl shadow-sm border flex gap-3"
                              >
                                <img
                                  src={clientImg}
                                  alt={clientName}
                                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <StarDisplay rating={review.rating} />
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-800 text-sm">{review.reviewText}</p>
                                  <p className="text-xs text-gray-500 mt-1 font-medium">
                                    By {clientName}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfileView;







