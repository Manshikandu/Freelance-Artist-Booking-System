// models/Payment.model.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist", // assuming this is separate from User
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  paymentMethod: {
    type: String,
    enum: ["PayPal", "eSewa", "Card", "Bank Transfer", "Cash"],
    default: "PayPal",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
      required: function () {
    return this.paymentStatus === "paid";
  },
  },
  payerEmail: String,
  paypalDetails: mongoose.Schema.Types.Mixed, 

  paidAt: {
    type: Date,
  },

  paymentType: {
  type: String,
  enum: ["advance", "final"],
  required: true,
  default: "advance",
},

  note: String,
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
