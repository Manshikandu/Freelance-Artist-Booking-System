// CancelBooking.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

const CancelBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [booking, setBooking] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const nonCancellableStatuses = [
    "cancelled",
    "completed",
    "cancellation_requested_by_client",
    "cancellation_requested_by_artist",
  ];

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err) {
        console.error("Failed to load booking:", err);
        toast.error("Failed to load booking details");
      }
    };
    fetchBooking();
  }, [bookingId]);

  const clientReasons = [
    "Change of plans",
    "Event got cancelled",
    "Artist was unresponsive",
    "Personal emergency",
    "Other",
  ];

  const artistReasons = [
    "Schedule conflict",
    "Personal emergency",
    "Client unresponsive",
    "Client uncooperative",
    "Payment issues",
    "Other",
  ];

  const reasonOptions = user.role === "artist" ? artistReasons : clientReasons;

  const handleGoBack = () => {
    navigate(user.role === "artist" ? "/artist-bookings" : "/my-bookings");
  };

  const handleCancel = async () => {
    const finalReason = selectedReason === "Other" ? customReason.trim() : selectedReason;

    if (!finalReason) {
      toast.error("Please select or provide a reason.");
      return;
    }

    if (!booking) return;

    if (nonCancellableStatuses.includes(booking.status)) {
      toast.error(`Cannot cancel. Booking already marked as ${booking.status}.`);
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        user.role === "artist"
          ? `/artist/bookings/${bookingId}/request-cancel`
          : `/bookings/${bookingId}/request-cancel`;

      const res = await axios.patch(endpoint, {
        reason: finalReason,
        notes,
      });

      if (res.status === 200) {
        toast.success("Cancellation request sent.");
        navigate(user.role === "artist" ? "/artist-bookings" : "/my-bookings");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to request cancellation");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Loading booking...
      </div>
    );
  }

  if (nonCancellableStatuses.includes(booking.status)) {
    return (
      <div className="max-w-xl mx-auto mt-10 bg-white shadow p-6 rounded-xl border text-center text-purple-600">
        <p>This booking cannot be cancelled. Current status: <strong>{booking.status}</strong></p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow p-6 rounded-xl border">
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="mb-4 flex items-center gap-2 text-purple-600 hover:bg-purple-300 transition bg-purple-200 p-2 rounded-sm font-semibold shadow-md"
      >
        <ArrowLeft className="w-5 h-5" />
        Back 
      </button>
      
      <h2 className="text-2xl font-bold mb-4 text-purple-600 text-center">Cancel Booking</h2>
      <p className="text-gray-600 mb-4">Please select a reason for cancelling this booking:</p>

      <div className="space-y-3 mb-6">
        {reasonOptions.map((r) => (
          <label key={r} className="flex items-center gap-2">
            <input
              type="radio"
              name="cancel-reason"
              value={r}
              checked={selectedReason === r}
              onChange={() => setSelectedReason(r)}
              className="accent-purple=900"
            />
            <span>{r}</span>
          </label>
        ))}
      </div>

      {selectedReason === "Other" && (
        <div className="mb-6">
          <label className="block mb-2 font-medium">Enter your reason</label>
          <input
            type="text"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Custom reason"
            className="w-full border rounded px-4 py-2"
          />
        </div>
      )}

      <div className="mb-6">
        <label className="block mb-2 font-medium">Additional Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="4"
          placeholder="Tell us more (optional)"
          className="w-full border rounded px-4 py-2"
        ></textarea>
      </div>

      <button
        disabled={loading}
        onClick={handleCancel}
        className={`w-full bg-purple-900 text-white py-2 rounded hover:bg-purple-500 transition flex justify-center items-center ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
        {loading ? "Submitting..." : "Request Cancellation"}
      </button>
    </div>
  );
};

export default CancelBooking;


