
import { useNavigate, useLocation } from "react-router-dom";
import { useState , useEffect} from "react";
import axios from "../lib/axios";
import toast, { Toaster } from "react-hot-toast";

function StarRating({ rating, setRating, readOnly = false }) {
  return (
    <div className="flex gap-1 mb-3 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => {
            if (!readOnly) setRating(star);
          }}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= rating ? "#facc15" : "none"}
          viewBox="0 0 24 24"
          stroke="#facc15"
          className={`w-12 h-12 cursor-${readOnly ? "default" : "pointer"} ${!readOnly && "hover:scale-110 transition-transform"}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.48 3.499l2.36 4.766 5.265.765-3.812 3.72.9 5.246-4.713-2.475-4.713 2.475.9-5.246-3.812-3.72 5.265-.765 2.36-4.766z"
          />
        </svg>
      ))}
    </div>
  );
}

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const paymentType = queryParams.get("paymentType");
  const isFinalPayment = paymentType === "final";
  const bookingId = queryParams.get("bookingId");
  const artistId = queryParams.get("artistId");

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleRedirectWithToast = (message) => {
    toast.success(message, {
      duration: 3000,
      position: "top-center",
    });
    setTimeout(() => {
      navigate("/my-bookings");
    }, 3100); 
  };

    if (!bookingId || !artistId) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10 text-center">
        <h1 className="text-red-600 font-bold mb-4">Missing booking or artist information.</h1>
        <button
          onClick={() => navigate("/my-bookings")}
          className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900"
        >
          Go to Bookings
        </button>
      </div>
    );
  }

  const handleSubmitReview = async () => {
    try {
      await axios.post("/reviews", {
        bookingId,
        rating,
        reviewText: reviewText.trim(),
      });

      setSubmitted(true);
      handleRedirectWithToast(" Thank you for your review!");
    } catch (error) {
      console.error("Failed to submit review:", error.response?.data || error.message);
      toast.error("Failed to submit review. Please try again.");
    }
  };

  const handleSkip = () => {
    setSubmitted(true);
    handleRedirectWithToast("Review skipped");
  };

   useEffect(() => {
    if (!isFinalPayment) {
      // advance payment success
      const timer = setTimeout(() => {
        navigate("/my-bookings");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isFinalPayment, navigate]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 mt-10 text-center">
      <Toaster />
      <h1 className="text-2xl font-bold text-green-600 mb-4"> Payment was successful!</h1>

      {isFinalPayment && !submitted && (
        <div className="mt-6 text-left">
          <h2 className="text-xl font-bold mb-2">Leave a Review</h2>
          <label className="block mb-1 text-left">Rate the artist:</label>
          <StarRating rating={rating} setRating={setRating} readOnly={submitted} />

          <label className="block mb-1">Review:</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full border p-2 rounded mb-3"
            readOnly={submitted}
          />
         <button
            onClick={handleSubmitReview}
            disabled={rating === 0 || reviewText.trim() === ""}
            className={`px-4 py-2 rounded mr-2 text-white ${
              rating === 0 || reviewText.trim() === ""
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Submit Review
          </button>

          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentSuccessPage;
