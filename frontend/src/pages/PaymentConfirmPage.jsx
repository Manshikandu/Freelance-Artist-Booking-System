

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import { Loader2, ArrowLeft } from "lucide-react";

const ConfirmCompletion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`/bookings/${id}`);
        setBooking(res.data.booking);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handleFinalPay = async () => {
    const remainingAmount = (booking.wage || 0) - (booking.advance || 0);
    if (remainingAmount <= 0) {
      alert("No remaining amount to pay.");
      return;
    }
    try {
      setPayLoading(true);
      const res = await axios.post("/payments/paypal/create", {
        bookingId: id,
        paymentType: "final",
      });
      if (res.data.success && res.data.approvalURL) {
        window.location.href = res.data.approvalURL;
      } else {
        alert("Could not initiate payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Payment error. Please try again.");
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return <div className="text-center mt-10 text-red-500">Booking not found.</div>;
  }

  const artist = booking.artist || {};
  const remainingAmount = (booking.wage || 0) - (booking.advance || 0);

  return (
    <div className="max-w-lg mx-auto mt-12 p-6">
      {/* Back Arrow */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-4 text-gray-600 hover:text-black"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-bold mb-6">Confirm and pay</h1>

      {/* Card */}
      <div className="max-w-xl mx-auto mt-10 border border-gray-100 bg-white shadow-lg rounded-lg p-6 space-y-6">
        <div className="flex gap-4 mb-4">
          {artist.profilePicture && (
            <img
              src={artist.profilePicture?.url ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="Artist"
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div>
            <h2 className="font-semibold text-lg">{artist.username}</h2>
            <p className="text-sm text-gray-500">{artist.category || "Event Performance"}</p>
          </div>
        </div>

        <hr className="my-4" />

        {/* Price Details */}
        <div className="text-sm space-y-3">
          <div className="flex justify-between">
            <span className="">Total Wage</span>
            <span>Rs {(booking.wage || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="">Advance Paid</span>
            <span>Rs {(booking.advance || 0).toFixed(2)}</span>
          </div>
          {/* <div className="flex justify-between font-medium">
            <span className="">Remaining</span>
            <span>Rs {remainingAmount.toFixed(2)}</span>
          </div> */}
        </div>

        <hr className="my-4" />

        <div className="flex justify-between font-bold">
          <span>Remaining amount</span>
          <span>Rs {remainingAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Buttons */}
      <div className="mt-6 space-y-3">
        <button
          onClick={handleFinalPay}
          disabled={payLoading || remainingAmount <= 0}
          className="w-full bg-purple-900 text-white hover:bg-purple-500 text-lg font-semibold py-3 rounded flex items-center justify-center disabled:bg-gray-400"
        >
          Pay with PayPal
        </button>

        {/* <button
          disabled
          className="w-full bg-black text-white text-lg font-medium py-3 rounded flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 8H3M21 16H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Debit or Credit Card
        </button> */}

      </div>
    </div>
  );
};

export default ConfirmCompletion;
