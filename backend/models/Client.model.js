import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,

  date: { type: Date, required: true },
  startTime: Date,
  endTime: Date,

  location: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number,
  },

  eventType: String,
  eventDetails: String,
  notes: String,

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },

  totalPrice: Number,

  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;