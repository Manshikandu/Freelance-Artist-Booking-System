
import React, { useEffect, useState, useCallback } from "react";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import socketService from "../lib/socket";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  Clock,
  Calendar,
  XCircle,
  User,
  MapPin,
  Loader2,
  Flag,
  Mail,
  Phone,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PDFViewer from "../components/PDFViewer";

const statusStyles = {
  pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-5 h-5 mr-1" />,
    label: "Pending",
  },
  accepted: {
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle className="w-5 h-5 mr-1" />,
    label: "Accepted",
  },
  booked: {
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-5 h-5 mr-1" />,
    label: "Booked",
  },
  completed: {
    color: "bg-gray-200 text-gray-800",
    icon: <Flag className="w-5 h-5 mr-1" />,
    label: "Completed",
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-5 h-5 mr-1" />,
    label: "Rejected",
  },
  cancelled: {
    color: "bg-red-600 text-white",
    icon: <XCircle className="w-5 h-5 mr-1" />,
    label: "Cancelled",
  },
  cancellation_requested_by_artist: {
    color: "bg-orange-100 text-orange-800",
    icon: <Clock className="w-5 h-5 mr-1" />,
    label: "Cancellation Requested by Artist",
  },
  cancellation_requested_by_client: {
    color: "bg-orange-100 text-orange-800",
    icon: <Clock className="w-5 h-5 mr-1" />,
    label: "Cancellation Requested by Client",
  },
};

const statusOptions = ["all", "pending", "accepted", "booked", "completed", "rejected", "cancelled", "cancellation_requests"];

const MyBookings = () => {
  const { user } = useUserStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("recentUpdated");
  const [expandedBookings, setExpandedBookings] = useState({});
  const [paymentDropdown, setPaymentDropdown] = useState({});
  const [payLoadingId, setPayLoadingId] = useState(null);
  const navigate = useNavigate();
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openContractUrl, setOpenContractUrl] = useState(null);

  // Create fetchBookings function that can be reused
  const fetchBookings = useCallback(async (showRefreshIndicator = false) => {
    if (!user) return;
    
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      let sortBy = "priority";
      let order = "desc";

      if (sortOrder === "newest") sortBy = "createdAt";
      else if (sortOrder === "oldest") {
        sortBy = "createdAt";
        order = "asc";
      } else if (sortOrder === "recentUpdated") sortBy = "updatedAt";

      const res = await axios.get(`/bookings/my-bookings?sortBy=${sortBy}&sortOrder=${order}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user, sortOrder]);

  // Socket.IO connection and event listeners
  useEffect(() => {
    if (!user) return;

    // Connect to socket
    socketService.connect();
    socketService.joinUserRoom(user._id);

    // Listen for notifications that might affect bookings
    const handleNotification = (notification) => {
      console.log('Received notification:', notification);
      
      // Check if notification is booking-related
      if (['booking', 'booking_cancellation_request', 'booking_cancellation_approval', 'payment'].includes(notification.type)) {
        // Show toast notification
        toast.success(`Update: ${notification.message}`);
        
        // Refresh bookings after a short delay to ensure backend is updated
        setTimeout(() => {
          fetchBookings(true);
        }, 1000);
      }
    };

    // Listen for direct booking updates
    const handleBookingUpdate = (data) => {
      console.log('Received booking update:', data);
      toast.success('Booking status updated');
      fetchBookings(true);
    };

    // Listen for payment updates
    const handlePaymentUpdate = (data) => {
      console.log('Received payment update:', data);
      toast.success('Payment status updated');
      fetchBookings(true);
    };

    socketService.onNotification(handleNotification);
    socketService.onBookingUpdate(handleBookingUpdate);
    socketService.onPaymentUpdate(handlePaymentUpdate);

    // Cleanup function
    return () => {
      socketService.off('notification', handleNotification);
      socketService.off('booking_update', handleBookingUpdate);
      socketService.off('payment_update', handlePaymentUpdate);
    };
  }, [user, fetchBookings]);

  // Initial fetch and fetch on sort order change
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Don't disconnect socket completely as other components might be using it
      // Just remove our specific listeners
      console.log('MyBookings component unmounted');
    };
  }, []);

  const toggleExpand = (id) => {
    setExpandedBookings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePaymentDropdown = (id) => {
    setPaymentDropdown((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePayNow = async (bookingId) => {
    try {
      setPayLoadingId(bookingId);
      const res = await axios.post("/payments/paypal/create", {
        bookingId,
        paymentType: "advance",
      });
      if (res.data.success && res.data.approvalURL) {
        window.location.href = res.data.approvalURL;
      }
    } catch (error) {
      console.error("Payment error", error);
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setPayLoadingId(null);
    }
  };

  const isCompletionConfirmable = (booking) =>
    user.role === "client" &&
    booking.status === "booked" &&
    booking.contractStatus === "signed" &&
    booking.advance > 0 &&
    !booking.isFinalPaid &&
    new Date() > new Date(booking.endTime);

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
        Loading your bookings...
      </div>
    );

  return (
    <>
      <div className="sticky top-0 z-50 bg-transparent p-4 ">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded-lg font-semibold shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6">Booking Requests</h2>

      <div className="sticky top-0 z-10 bg-white pb-4 pt-2 mb-4 shadow-sm">
        {isRefreshing && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Updating bookings...</span>
          </div>
        )}
        <StatusFilter filterStatus={filterStatus} setFilterStatus={setFilterStatus} />
        <div className="flex justify-end px-4">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border rounded text-indigo-700 border-indigo-600"
          >
            <option value="recentUpdated">Sort by: Recently Updated</option>
            <option value="newest">Sort by: Newest Created</option>
            <option value="oldest">Sort by: Oldest Created</option>
            <option value="priority">Sort by: Priority</option>
          </select>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <p className="text-center mt-10 text-gray-500 text-lg flex flex-col items-center">
          <Info className="w-8 h-8 mb-2" />
          You don’t have any {filterStatus !== "all" ? `"${filterStatus}"` : ""} bookings yet.
          <button
            onClick={() => navigate("/artists")}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Browse Artists
          </button>
        </p>
      ) : (
        filteredBookings.map((booking) => {
          const bookingName =
            user.role === "client" ? booking.artist?.username || "Artist" : booking.client?.username || "Client";
          const status = statusStyles[booking.status] || { color: "text-gray-700", icon: null, label: booking.status };

          // Debug log to see booking status
          console.log(`MyBookings - Booking ${booking._id} status:`, booking.status);

          return (
            <div
              key={booking._id}
              className="bg-white shadow hover:shadow-lg transition rounded-2xl p-6 mb-6 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-indigo-700 flex items-center">
                  <img
                    src={booking.artist.profilePicture?.url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt={`${bookingName}'s profile`}
                    className="w-10 h-10 rounded-full mr-2 object-cover"
                  />
                  {bookingName}
                </h3>
                <div className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${status.color}`}>
                  {status.icon}
                  <span>{status.label}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-md mb-2">
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
                    ? `${new Date(booking.startTime).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })} - ${new Date(booking.endTime).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}`
                    : "Time not set"}
                </div>

                {booking.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                    {booking.location}
                  </div>
                )}

                {user.role === "client" && booking.artist?.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-indigo-500" />
                    {booking.artist.email}
                  </div>
                )}

                {user.role === "client" && booking.artist?.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-indigo-500" />
                    {booking.artist.phone}
                  </div>
                )}

                {user.role === "artist" && booking.client?.email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-indigo-500" />
                    {booking.client.email}
                  </div>
                )}

                {user.role === "artist" && booking.client?.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-indigo-500" />
                    {booking.client.phone}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-3">
                <button
                  onClick={() => toggleExpand(booking._id)}
                  className="text-md text-indigo-600 hover:underline font-medium flex items-center"
                >
                  <Info className="w-4 h-4 mr-1" />
                  {expandedBookings[booking._id] ? "Hide Details" : "More"}
                  {expandedBookings[booking._id] ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>

                {/* {["accepted", "booked", "completed"].includes(booking.status) && (
                  <div className="flex flex-col gap-3 items-start md:items-end">
                    <div className="flex flex-wrap gap-2 relative">
                      {booking.contractStatus === "none" || !booking.contractUrl ? (
                        <button
                          onClick={() => navigate(`/generate-contract/${booking._id}`)}
                          className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
                        >
                          Generate Contract
                        </button>
                      ) : (
                        <>
                          <a
                            href={`http://localhost:3000${booking.contractUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-1.5 rounded text-md font-medium transition ${
                              booking.contractStatus === "signed"
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-yellow-500 text-black hover:bg-yellow-600"
                            }`}
                          >
                            {booking.contractStatus === "signed" ? "View Signed Contract" : "View Contract"}
                          </a> */}

                          {["accepted", "booked", "completed"].includes(booking.status) && (
                    <div className="flex flex-col gap-3 items-start md:items-end">
                      <div className="flex flex-wrap gap-2 relative">
                        {booking.contractStatus === "none" || !booking.contractUrl ? (
                          <button
                            onClick={() => navigate(`/generate-contract/${booking._id}`)}
                            className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
                          >
                            Generate Contract
                          </button>
                        ) : (
                          <>
                            {/* Replace the <a> tag with a button to open modal */}
                            <button
                              onClick={() => setOpenContractUrl(booking.contractUrl)}
                              className={`px-4 py-1.5 rounded text-md font-medium transition ${
                                booking.contractStatus === "signed"
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-yellow-500 text-black hover:bg-yellow-600"
                              }`}
                            >
                              {booking.contractStatus === "signed" ? "View Signed Contract" : "View Contract"}
                            </button>

                          {user.role === "client" && booking.contractStatus === "signed" && !booking.isPaid && (
                            <button
                              onClick={() => handlePayNow(booking._id)}
                              disabled={payLoadingId === booking._id}
                              className={`bg-purple-600 text-white px-4 py-1.5 rounded hover:bg-purple-700 flex items-center ${
                                payLoadingId === booking._id ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              {payLoadingId === booking._id && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                              {payLoadingId === booking._id ? "Processing..." : "Pay Now"}
                            </button>
                          )}
                        
                          {/* 🔽 NEW Payment Dropdown */}
                          {(booking.payments?.some((p) => p.type === "advance") ||
                            (booking.isFinalPaid && booking.payments?.some((p) => p.type === "final"))) && (
                            <div className="relative">
                              <button
                                onClick={() => togglePaymentDropdown(booking._id)}
                                className="bg-indigo-600 text-white px-4 py-1.5 rounded hover:bg-indigo-700 flex items-center text-sm font-medium"
                              >
                                Payment
                                {paymentDropdown[booking._id] ? (
                                  <ChevronUp className="w-4 h-4 ml-2" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 ml-2" />
                                )}
                              </button>
                              {paymentDropdown[booking._id] && (
                              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                  {booking.payments?.some((p) => p.type === "advance") && (
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/payments/receipt/${booking.payments.find((p) => p.type === "advance")?.paymentId}`
                                        )
                                      }
                                      className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-100"
                                    >
                                      View Advance Receipt
                                    </button>
                                  )}
                                  <div className="border-t border-gray-200 my-1 mx-2"></div>

                                  {booking.isFinalPaid && booking.payments?.some((p) => p.type === "final") && (
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/payments/receipt/${booking.payments.find((p) => p.type === "final")?.paymentId}`
                                        )
                                      }
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
                              className={`ml-4 bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700 transition flex items-center ${
                                cancelLoadingId === booking._id ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              {cancelLoadingId === booking._id && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                              Cancel Booking
                            </button>
                          )}

                        </>
                      )}
                    </div>

                    {isCompletionConfirmable(booking) && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/booking/confirm-completion/${booking._id}`)}
                          className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
                        >
                          Confirm Completion
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Approve Cancellation Button - Only for clients when artist requests cancellation */}
              {user.role === "client" && booking.status === "cancellation_requested_by_artist" && (
                <div className="mt-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 text-orange-800">
                    <p className="text-sm font-medium">Cancellation Request from Artist</p>
                    <p className="text-sm">The artist has requested to cancel this booking. Please review and approve or contact them for more details.</p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={async () => {
                        if (!window.confirm("Do you want to approve the cancellation request?")) return;
                        try {
                          setCancelLoadingId(booking._id);
                          const res = await axios.patch(`/bookings/${booking._id}/approve-cancel`);
                          if (res.status === 200) {
                            toast.success("Cancellation approved.");
                            await fetchBookings();
                          }
                        } catch (err) {
                          console.error(err);
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

              {/* Show cancellation status for client's own requests */}
              {user.role === "client" && booking.status === "cancellation_requested_by_client" && (
                <div className="mt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800">
                    <p className="text-sm font-medium">Cancellation Request Pending</p>
                    <p className="text-sm">You have requested to cancel this booking. Waiting for artist approval.</p>
                  </div>
                </div>
              )}

              {expandedBookings[booking._id] && (
                <div className="mt-4 text-sm text-gray-700 space-y-1">
                  {(booking.eventType || booking.eventDetails) && (
                    <>
                      <p><strong>Type:</strong> {booking.eventType || "N/A"}</p>
                      <p><strong>Details:</strong> {booking.eventDetails || "N/A"}</p>
                    </>
                  )}
                  {booking.notes && <p className="italic text-gray-600 mt-2">Notes: "{booking.notes}"</p>}
                </div>
              )}
            </div>
          );
        })
      )}
           <PDFViewer
          contractUrl={openContractUrl}
          isOpen={!!openContractUrl}
          onClose={() => setOpenContractUrl(null)}
          title="Contract Document"
        />
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
    <div className="mb-6 flex flex-wrap gap-4 justify-center">
      {statusOptions.map((status) => (
        <button
          key={status}
          onClick={() => setFilterStatus(status)}
          aria-pressed={filterStatus === status}
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

export default MyBookings;





