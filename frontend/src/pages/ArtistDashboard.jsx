import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import ArtistNavbar from "./Artist/ArtistNavbar";

export default function ArtistDashboard() {
  const artist = useUserStore((state) => state.user);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const res = await axios.get("/jobposts/applied", { withCredentials: true });
        setAppliedJobs(res.data);
      } catch (error) {
        toast.error("Failed to fetch applied jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, []);

useEffect(() => {
  const fetchBookings = async () => {
    try {
      const res = await axios.get("/artist/bookings/upcoming", { withCredentials: true });
      const allBookings = res.data.bookings;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Keep only bookings with eventDate >= today
      const upcoming = allBookings.filter(b => {
        const eventDate = new Date(b.eventDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      });

      // Extract unique sorted event dates
      const uniqueDates = Array.from(
        new Set(upcoming.map(b => new Date(b.eventDate).setHours(0, 0, 0, 0)))
      ).sort((a, b) => a - b);

      // Get only the nearest 2 dates
      const datesToShow = uniqueDates.slice(0, 2);

      // Filter bookings to only those 2 dates
      const filteredBookings = upcoming.filter(b => {
        const d = new Date(b.eventDate).setHours(0, 0, 0, 0);
        return datesToShow.includes(d);
      });

      setBookings(filteredBookings);
    } catch (error) {
      toast.error("Failed to fetch upcoming bookings");
    } finally {
      setLoading(false);
    }
  };

  fetchBookings();
}, []);


  return (
    <>
      <ArtistNavbar active="dashboard" />
      <div className="min-h-screen bg-gradient-to-br from-purple-300 p-6 pt-24 text-black">
        <div className="max-w-6xl mx-auto bg-white/10 rounded-2xl p-6 backdrop-blur-md min-h-screen">
          <header className="mb-6 flex items-center gap-4">
            <img
              src={
                artist?.profilePicture?.url ||
                artist?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              className="w-14 h-14 rounded-full object-cover bg-gray-300"
            />
            <h1 className="text-3xl font-bold">Welcome back, {artist?.username || "Artist"}!</h1>
          </header>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-white rounded-xl p-6 shadow-md text-black">
              <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                📅 Upcoming Bookings
              </h2>

              {loading ? (
                <p className="text-gray-500">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <p className="text-gray-500">No upcoming bookings.</p>
              ) : (
                <div className="max-h-[500px] overflow-y-auto space-y-4 pr-1">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-purple-50 border border-purple-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition duration-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-purple-900">
                          {booking.eventType || "Event"}
                        </h3>
                        <span className="text-sm text-gray-600">
                          {new Date(booking.eventDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-sm text-gray-800 mb-1">
                         <span className="font-medium">Time:</span>{" "}
                        {booking.startTime && booking.endTime
                          ? `${new Date(booking.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} - ${new Date(booking.endTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "N/A"}
                      </div>

                      <div className="text-sm text-gray-800">
                         <span className="font-medium">Location:</span> {booking.location}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
{/* 
            <div className="bg-white rounded-xl p-4 text-black">
              <h2 className="text-lg font-semibold text-blue-700 mb-2">Earnings Overview</h2>
              <p className="text-xl font-bold">This Month: Rs 2,400</p>
              <p>Total Gigs: 8</p>
            </div> */}
          </div>

       
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">Jobs You Have Applied To</h2>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : appliedJobs.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow text-center">
                <p className="text-gray-600 text-lg"> You haven't applied to any jobs yet.</p>
                <p className="text-sm text-gray-500 mt-1">Start exploring job posts and apply to get hired!</p>
                <Link
                  to="/post"
                  className="inline-block mt-4 bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800 transition"
                >
                  View Available Jobs
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appliedJobs.map(({ jobPostId, appliedAt }, index) => {
                  if (!jobPostId) return null; // Skip if job data is missing

                  return (
                    <div key={jobPostId._id || index} className="bg-white p-4 rounded-xl shadow">
                      <h3 className="text-xl font-bold text-purple-700 mb-2">{jobPostId.title}</h3>
                      <p className="text-gray-700 mb-1">{jobPostId.description}</p>
                      <p className="text-sm text-gray-500 mb-1">
                        Date: {jobPostId.date ? new Date(jobPostId.date).toLocaleDateString() : "N/A"}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">Budget: Rs. {jobPostId.budget || "N/A"}</p>
                      <p className="text-sm text-gray-500 mb-1">
                        Location: {jobPostId.location?.city || "N/A"}, {jobPostId.location?.state || ""}
                      </p>
                      <p className="text-sm text-green-600">
                        Applied on: {appliedAt ? new Date(appliedAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
