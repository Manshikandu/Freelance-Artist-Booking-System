

import React, { useEffect, useState, useCallback } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import socketService from "../../lib/socket";

import BookingLocationMap from "../../components/BookingLocationMap";

import {CheckCircle,Clock, Calendar, XCircle, User, MapPin, Loader2, Flag, Mail, Phone, Info,ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import PDFViewer from "../../components/PDFViewer";

const statusStyles = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-5 h-5 mr-1" />, label: "Pending" },
  accepted: { color: "bg-blue-100 text-blue-800", icon: <CheckCircle className="w-5 h-5 mr-1" />, label: "Accepted" },
  booked: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-5 h-5 mr-1" />, label: "Booked" },
  completed: { color: "bg-gray-200 text-gray-800", icon: <Flag className="w-5 h-5 mr-1" />, label: "Completed" },
  rejected: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-5 h-5 mr-1" />, label: "Rejected" },
  cancelled: { color: "bg-red-600 text-white", icon: <XCircle className="w-5 h-5 mr-1" />, label: "Cancelled" },
};

const statusOptions = ["all", "pending", "accepted", "booked", "completed", "rejected", "cancelled", "cancellation_requests"];

const sortOptions = [
  { value: "recentUpdated", label: "Sort by: Recently Updated" },
  { value: "priority", label: "Sort by: Priority" },
  { value: "newest", label: "Sort by: Newest Created" },
  { value: "oldest", label: "Sort by: Oldest Created" },
];

const ArtistBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recentUpdated");
  const [expandedBookings, setExpandedBookings] = useState({});
  const [mapOpenBookingId, setMapOpenBookingId] = useState(null);
  const [paymentDropdown, setPaymentDropdown] = useState({});
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const [openContractUrl, setOpenContractUrl] = useState(null);

  // Create fetchBookings function that can be reused
  const fetchBookings = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      let sortOrder = "desc";

      if (sortBy === "oldest") sortOrder = "asc";
      else if (sortBy === "newest") sortOrder = "desc";
      else if (sortBy === "recentUpdated") sortOrder = "desc";
      else if (sortBy === "priority") sortOrder = "desc";

      const res = await axios.get(
        `/artist/bookings/my-bookings?sortBy=${sortBy}&sortOrder=${sortOrder}`,
        { withCredentials: true }
      );
      setBookings(res.data.bookings);
    } catch (err) {
      toast.error("Error loading bookings");
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (!user) return;

    socketService.connect();
    socketService.joinUserRoom(user._id);

    const handleNotification = (notification) => {
      console.log('Received notification:', notification);
      
      if (['booking', 'booking_cancellation_request', 'booking_cancellation_approval', 'payment'].includes(notification.type)) {
        toast.success(`Update: ${notification.message}`);
        
        setTimeout(() => {
          fetchBookings(true);
        }, 1000);
      }
    };

    const handleBookingUpdate = (data) => {
      console.log('Received booking update:', data);
      toast.success('Booking status updated');
      fetchBookings(true);
    };

    const handlePaymentUpdate = (data) => {
      console.log('Received payment update:', data);
      toast.success('Payment status updated');
      fetchBookings(true);
    };

    socketService.onNotification(handleNotification);
    socketService.onBookingUpdate(handleBookingUpdate);
    socketService.onPaymentUpdate(handlePaymentUpdate);

    return () => {
      socketService.off('notification', handleNotification);
      socketService.off('booking_update', handleBookingUpdate);
      socketService.off('payment_update', handlePaymentUpdate);
    };
  }, [user, fetchBookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id, status) => {
    try {
      console.log("Updating booking status:", { id, status });
      console.log("User:", user);
      
      const res = await axios.put(`/artist/bookings/${id}/status`, { status }, { withCredentials: true });
      console.log("Update status response:", res.status, res.data);
      if (res.status >= 200 && res.status < 300) {
        toast.success(`Booking ${status} successfully`);
        await fetchBookings();
      } else {
        console.error("Unexpected status code:", res.status);
        toast.error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error headers:", err.response?.headers);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to update booking";
      toast.error(errorMessage);
    }
  };

  const toggleExpand = (id) => {
    setExpandedBookings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const togglePaymentDropdown = (id) => {
  setPaymentDropdown((prev) => ({ ...prev, [id]: !prev[id] }));
};

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : filterStatus === "cancellation_requests"
      ? bookings.filter((b) => 
          b.status === "cancellation_requested_by_artist" || 
          b.status === "cancellation_requested_by_client"
        )
      : bookings.filter((b) => b.status === filterStatus);

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center text-yellow-500">
        <Loader2 className="animate-spin w-8 h-8 mr-2" />
        Loading bookings...
      </div>
    );

  if (filteredBookings.length === 0)
    return (
      <>
        <StatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
        <p className="text-center mt-10 text-gray-500 text-lg">
          No bookings found for "{filterStatus}" status.
        </p>
      </>
    );

  const activeBooking = bookings.find((b) => b._id === mapOpenBookingId);

  return (
    <>
      <div className="sticky top-0 z-40 bg-transparent p-4">
        <button 
          onClick={() => navigate("/artisthome")} 
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded-lg font-semibold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">Booking Requests</h2>

      <div className="sticky top-0 z-30 bg-white pb-4 pt-2 mb-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        {isRefreshing && (
          <div className="w-full mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Updating bookings...</span>
          </div>
        )}
        <StatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />

        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded text-indigo-700 border-indigo-600"
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredBookings.map((booking) => {
        const bookingName = booking.client?.username || "Client";
        const status = statusStyles[booking.status] || {
          color: "text-gray-700",
          icon: null,
          label: booking.status,
        };

        return (
          <div
            key={booking._id}
            className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-6 mb-6 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold flex items-center text-indigo-700">
               <img
                    src={booking.client.profilePicture?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt={`${bookingName}'s profile`}
                    className="w-10 h-10 rounded-full mr-2 object-cover"
                  />
                {bookingName}
              </h3>

              <div
                className={`flex items-center text-sm font-medium px-3 py-1 rounded-full border ${status.color} border-opacity-30`}
              >
                {status.icon}
                <span className={status.color}>{status.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-4 text-md">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                {new Date(booking.eventDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </div>

              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                {booking.startTime && booking.endTime
                  ? `${new Date(booking.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })} - ${new Date(booking.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}`
                  : "Time not set"}
              </div>

              {booking.client?.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-indigo-500" />
                  {booking.client.email}
                </div>
              )}

              {booking.client?.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-indigo-500" />
                  {booking.client.phone}
                </div>
              )}
            </div>

            {booking.coordinates && (
              <div className="flex items-center mt-3 gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <span>{booking.location || "Coordinates Provided"}</span>
                <button
                  onClick={() => setMapOpenBookingId(booking._id)}
                  className="ml-auto bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600 transition"
                >
                  Show Map
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-3">
              <button
                onClick={() => toggleExpand(booking._id)}
                className="text-md text-indigo-600 hover:underline font-medium flex items-center"
              >
                <Info className="w-4 h-4 mr-1" aria-label="More Info" />
                {expandedBookings[booking._id] ? "Hide Details" : "More"}
                {expandedBookings[booking._id] ? (
                  <ChevronUp className="w-4 h-4 ml-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </button>

              
                  {booking.contractUrl && (
                <div className="mt-4 flex flex-col md:flex-row justify-end gap-3">
                  {booking.contractStatus !== "signed" ? (
                    <Link
                      to={`/contracts/artist-sign/${booking._id}`}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-center"
                    >
                      Sign Contract
                    </Link>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Opening contract:', booking.contractUrl);
                        setOpenContractUrl(booking.contractUrl);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-center"
                      type="button"
                    >
                      View Signed Contract
                    </button>
                  )}
                  
                  {/* View Payment Buttons */}
                  {(booking.payments?.some(p => p.paymentType === "advance") ||
                    booking.payments?.some(p => p.paymentType === "final")) && (
                    <div className="relative">
                      <button
                        onClick={() => togglePaymentDropdown(booking._id)}
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 flex items-center text-lg font-medium"
                      >
                        Payment
                        {paymentDropdown[booking._id] ? (
                          <ChevronUp className="w-4 h-4 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2" />
                        )}
                      </button>
                      {paymentDropdown[booking._id] && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                          {booking.payments?.some(p => p.paymentType === "advance") && (
                            <button
                              onClick={() => navigate(`/payments/receipt/${booking.payments.find(p => p.paymentType === "advance")?._id}`)}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-100"
                            >
                              View Advance Receipt
                            </button>
                          )}
                          <div className="border-t border-gray-200 my-1 mx-2"></div>
                          {booking.payments?.some(p => p.paymentType === "final") && (
                            <button
                              onClick={() => navigate(`/payments/receipt/${booking.payments.find(p => p.paymentType === "final")?._id}`)}
                              className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-100"
                            >
                              View Final Receipt
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {["pending", "accepted", "booked"].includes(booking.status) && (
                    <button
                      disabled={cancelLoadingId === booking._id}
                      onClick={() => navigate(`/booking/cancel/${booking._id}`)}
                      className={`ml-4 bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-700 transition flex items-center ${
                        cancelLoadingId === booking._id ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {cancelLoadingId === booking._id && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                      Cancel Booking
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Approve Cancellation Button - Only for artists when client requests cancellation */}
            {booking.status === "cancellation_requested_by_client" && (
              <div className="mt-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 text-orange-800">
                  <p className="text-sm font-medium">Cancellation Request from Client</p>
                  <p className="text-sm">The client has requested to cancel this booking. Please review and approve or contact them for more details.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      if (!window.confirm("Do you want to approve the cancellation request?")) return;
                      try {
                        setCancelLoadingId(booking._id);
                        const res = await axios.patch(`/artist/bookings/${booking._id}/approve-cancel`);
                        console.log("Approve cancellation response:", res.status, res.data);
                        // Check for successful status codes (200, 201, 204, etc.)
                        if (res.status >= 200 && res.status < 300) {
                          toast.success("Cancellation approved.");
                          await fetchBookings();
                        } else {
                          console.error("Unexpected status code:", res.status);
                          toast.error("Unexpected response from server");
                        }
                      } catch (err) {
                        console.error("Error approving cancellation:", err);
                        toast.error(err.response?.data?.message || "Approval failed");
                      } finally {
                        setCancelLoadingId(null);
                      }
                    }}
                    disabled={cancelLoadingId === booking._id}
                    className={`bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 flex items-center ${
                      cancelLoadingId === booking._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {cancelLoadingId === booking._id && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                    Approve Cancellation
                  </button>
                </div>
              </div>
            )}

            {/* Show cancellation status for artist's own requests */}
            {booking.status === "cancellation_requested_by_artist" && (
              <div className="mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800">
                  <p className="text-sm font-medium">Cancellation Request Pending</p>
                  <p className="text-sm">You have requested to cancel this booking. Waiting for client approval.</p>
                </div>
              </div>
            )}

            {expandedBookings[booking._id] && (
              <div className="mb-4 text-gray-700 text-sm space-y-2">
                {(booking.eventType || booking.eventDetails) && (
                  <div>
                    <p>
                      <strong>Type:</strong> {booking.eventType || "N/A"}
                    </p>
                    <p>
                      <strong>Details:</strong> {booking.eventDetails || "N/A"}
                    </p>
                  </div>
                )}

                {booking.notes && <p className="italic">Notes: "{booking.notes}"</p>}
              </div>
            )}

            {booking.status === "pending" && (
              <div className="mt-5 flex gap-4">
                <button
                  onClick={() => updateStatus(booking._id, "accepted")}
                  className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-400 transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(booking._id, "rejected")}
                  className="bg-red-700 text-white px-5 py-2 rounded hover:bg-red-500 transition"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        );
      })}

      {activeBooking && activeBooking.coordinates && (
        <BookingLocationMap
          isOpen={!!mapOpenBookingId}
          onRequestClose={() => setMapOpenBookingId(null)}
          bookingLocation={[activeBooking.coordinates.lat, activeBooking.coordinates.lng]}
        />
      )}
      
      {openContractUrl && (
        <PDFViewer
          contractUrl={openContractUrl}
          isOpen={!!openContractUrl}
          onClose={() => setOpenContractUrl(null)}
          title="Contract Document"
        />
      )}
    </div>
    </>
  );
};

function StatusFilter({ filterStatus, setFilterStatus }) {
  const getStatusLabel = (status) => {
    if (status === "cancellation_requests") {
      return "Cancellation Requests";
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="mb-6 flex flex-wrap gap-3 justify-center">
      {statusOptions.map((status) => (
        <button
          key={status}
          onClick={() => setFilterStatus(status)}
          className={`px-4 py-2 rounded-full border ${
            filterStatus === status
              ? "bg-indigo-600 text-white border-indigo-600"
              : "text-indigo-600 border-indigo-600 hover:bg-indigo-100"
          } transition`}
        >
          {getStatusLabel(status)}
        </button>
      ))}
    </div>
  );
}

export default ArtistBookings;

