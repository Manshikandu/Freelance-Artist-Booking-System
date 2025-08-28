

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ["booking", "contract", "payment", "review", "system","booking_cancellation_request", "booking_cancellation_approval"],
    default: "system",
  },
  isRead: { type: Boolean, default: false },
  
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