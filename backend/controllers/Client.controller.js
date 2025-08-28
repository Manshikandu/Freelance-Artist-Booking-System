import Booking from "../models/Artist.Booking.model.js";
import Artist from "../models/Artist.model.js"; 
import User from "../models/user.model.js"; 

// @desc    Create a new booking request for an artist
// @route   POST /api/booking/request
export const bookingArtist = async (req, res) => {
  try {
    const {
      name, email, phone,
      date, startTime, endTime,
      location, coordinates,
      eventType, eventDetails, notes,
      artistId
    } = req.body;

    const clientId = req.user ? req.user._id : null; // if using protectRoute

    if (!name || !email || !date || !location || !artistId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const artistExists = await Artist.findById(artistId);
    if (!artistExists) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const newBooking = new Booking({
      name,
      email,
      phone,
      date,
      startTime,
      endTime,
      location,
      coordinates,
      eventType,
      eventDetails,
      notes,
      artistId,
      clientId,
      status: "pending",
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking request submitted", booking: newBooking });
  } catch (error) {
    console.error("Error booking artist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getBookingRequest = async (req, res) => {
  try {
    const { artistId } = req.params;

    const bookings = await Booking.find({ artistId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const BookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // expected: "pending", "accepted", "rejected", "completed"

    if (!["pending", "accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};