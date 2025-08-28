// const mongoose = require("mongoose");

// const notificationSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   message: { type: String, required: true },
//   type: { type: String, enum: ["booking", "contract", "payment", "system"], default: "system" },
//   isRead: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model("Notification", notificationSchema);

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // refPath: "userType", // Dynamically reference either Client or Artist
  },
  // userType: {
  //   type: String,
  //   required: true,
  //   enum: ["Client", "Artist"], // match your model names
  // },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["booking", "contract", "payment", "review", "system","booking_cancellation_request", "booking_cancellation_approval"],
    default: "system",
  },
  isRead: { type: Boolean, default: false },
  
  // Optional reference fields for better navigation
  bookingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Booking",
    required: false 
  },
  paymentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Payment",
    required: false 
  },
  artistId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Artist",
    required: false 
  },
 
}, {
  timestamps: true, 
});
const Notification= mongoose.model("Notification", notificationSchema);

export default Notification;