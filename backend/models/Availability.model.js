import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  from: {
    type: Date,
    required: [true, "Start date is required"]
  },
  to: {
    type: Date,
    required: [true, "End date is required"]
  },
  status: {
    type: String,
    enum: ["available", "booked", "unavailable"],
    default: "available"
  },
  eventDetails: {
    title: { type: String },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    location: { type: String }
  }
}, {
  timestamps: true
});

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
