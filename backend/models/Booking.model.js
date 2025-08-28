import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    location: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    eventType: String,
    eventDetails: String,
    notes: String,
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);