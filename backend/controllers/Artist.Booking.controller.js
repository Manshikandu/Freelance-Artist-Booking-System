//Artist.Booking.controller.js
import mongoose from "mongoose";
import Booking from "../models/Artist.Booking.model.js";
import Artist from "../models/Artist.model.js";
import { createNotificationAndEmit } from "../controllers/Notification.controller.js";
import { calculateBookingScore } from "../utils/bookingPriority.js";
import Payment from "../models/Payment.model.js";

// import { refundPayment } from "../utils/paypalRefund.js";

export const createBooking = async (req, res) => {
  try {
    const {
      eventDate,
      startTime,
      endTime,
      location,
      coordinates,
      contactName,
      contactEmail,
      contactPhone,
      eventType,
      eventDetails,
      notes,
      artistId, 
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    const clientId = req.user._id;

    const artistExists = await Artist.findById(artistId);
    if (!artistExists) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // ENHANCED: Use atomic transaction for race condition prevention
    const session = await mongoose.startSession();
    
    try {
      const newBooking = await session.withTransaction(async () => {
        // Mathematical conflict detection with atomic transaction protection
        const BUFFER_MS = 30 * 60 * 1000; // 30 minutes buffer
        const newStart = new Date(startTime).getTime();
        const newEnd = new Date(endTime).getTime();

        // ATOMIC CONFLICT CHECK: This locks the documents during transaction
        const conflictingBooking = await Booking.findOne({
          artist: artistId,
          status: { $in: ['accepted', 'booked'] },
          // Mathematical time overlap detection
          $or: [
            {
              // Case 1: New booking starts during existing booking (with buffer)
              startTime: { $lte: new Date(newEnd) },
              endTime: { $gt: new Date(newStart - BUFFER_MS) }
            },
            {
              // Case 2: New booking ends during existing booking (with buffer)
              startTime: { $lt: new Date(newEnd + BUFFER_MS) },
              endTime: { $gte: new Date(newStart) }
            },
            {
              // Case 3: Existing booking is completely within new booking (with buffer)
              startTime: { $gte: new Date(newStart - BUFFER_MS) },
              endTime: { $lte: new Date(newEnd + BUFFER_MS) }
            }
          ]
        }).session(session);

        if (conflictingBooking) {
          throw new Error("Booking conflict: The selected time slot conflicts with an existing booking.");
        }

        // ATOMIC BOOKING CREATION: Only happens if no conflicts found
        const booking = new Booking({
          client: clientId,
          artist: artistId,
          eventDate,
          startTime,
          endTime,
          location,
          coordinates,
          contactName,
          contactEmail,
          contactPhone,
          eventType,
          eventDetails,
          notes,
          status: "pending",
        });

        await booking.save({ session });
        return booking;
      });

      await session.endSession();

      await createNotificationAndEmit({
        userId: artistId,
        userType: "Artist",
        type: "booking",
        message: `New booking request from ${req.user.username || 'a client'}.`,
      });

      res.status(201).json({
        message: "Booking request sent successfully",
        booking: newBooking,
      });

    } catch (transactionError) {
      await session.endSession();
      
      if (transactionError.message.includes("Booking conflict")) {
        return res.status(409).json({ 
          message: transactionError.message,
          type: "CONFLICT_ERROR"
        });
      }
      
      throw transactionError; // Re-throw for main catch block
    }
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error while creating booking" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sortBy = "priority", sortOrder = "desc" } = req.query;

    let query;
    if (req.user.role === "client") {
      query = Booking.find({ client: userId }).populate("artist", "username email phone profilePicture");
    } else if (req.user.role === "artist") {
      query = Booking.find({ artist: userId }).
      populate("client", "username email phone");
    } else {
      return res.status(403).json({ error: "Invalid role" });
    }

    // Execute query without sort for now
    const bookings = await query;
    const bookingIds = bookings.map((b) => b._id);
    const payments = await Payment.find({
      bookingId: { $in: bookingIds },
      paymentStatus: "paid",
    }).select("bookingId _id paymentType"); 

    let sortedBookings;

    if (sortBy === "createdAt") {
      sortedBookings = bookings.sort((a, b) => {
        return sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (sortBy === "updatedAt") {
      sortedBookings = bookings.sort((a, b) => {
        return sortOrder === "asc"
          ? new Date(a.updatedAt) - new Date(b.updatedAt)
          : new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    } else if (sortBy === "priority") {
      const scored = bookings.map((b) => ({
        ...b.toObject(),
        score: calculateBookingScore(b),
      }));
      sortedBookings = scored.sort((a, b) =>
        sortOrder === "asc" ? a.score - b.score : b.score - a.score
      );
    } else {
      // Default fallback: updatedAt desc
      sortedBookings = bookings.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    const bookingsWithPayments = sortedBookings.map((booking) => {
      const relatedPayments = payments
        .filter((p) => p.bookingId.toString() === booking._id.toString())
        .map((p) => ({
          paymentId: p._id,
          type: p.paymentType,
        }));
      return {
        ...booking.toObject(),
        payments: relatedPayments,
      };
    });

    res.json(bookingsWithPayments);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Server error while fetching bookings" });
  }
};


export const getBookedSlotsForArtist = async (req, res) => {
  try {
    const { artistId } = req.params;

    const bookings = await Booking.find({
      artist: artistId,
      status: { $in: ["accepted", "booked"] },
    }).select("eventDate startTime endTime status");  // Added status

    res.status(200).json({ bookedSlots: bookings });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ message: "Server error fetching booked slots" });
  }
};


export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("artist", "username email phone category wage profilePicture") 
      .populate("client", "username email phone");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // console.log("Logged in user ID:", req.user?._id);
    // console.log("Booking client ID:", booking.client._id.toString());
    // console.log("Booking artist ID:", booking.artist._id.toString());
    
    const userIdStr = req.user._id.toString();

    if (
      booking.client._id.toString() !== userIdStr &&
      booking.artist._id.toString() !== userIdStr
    ) {
      return res.status(403).json({ message: "Access denied to this booking" });
    }

    res.json({ booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Error fetching booking details" });
  }
};

export const requestCancellationByClient = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .populate("client", "username email")
      .populate("artist", "username email");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.client._id.toString() !== userId) {
      return res.status(403).json({ message: "You can only request cancellation for your own bookings." });
    }
      console.log("Current booking status:", booking.status);

    if (["cancelled", "completed", "cancellation_requested_by_client", "cancellation_requested_by_artist"].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot request cancellation for a booking with status ${booking.status}.` });
    }

    booking.status = "cancellation_requested_by_client"; // New status indicating client requested cancellation
    booking.cancelledBy = "client";

    await booking.save();

    // Notify artist about cancellation request
    await createNotificationAndEmit({
      userId: booking.artist._id,
      userType: "Artist",
      type: "booking_cancellation_request",
      message: `Client ${booking.client.username} has requested cancellation for booking on ${booking.eventDate.toDateString()}. Please respond.`,
      bookingId: booking._id.toString(),
    });

    return res.status(200).json({ message: "Cancellation request sent to artist." });
  } catch (err) {
    console.error("Client cancellation request error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};


export const approveArtistCancellationByClient = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id; // client ID

    const booking = await Booking.findById(bookingId)
      .populate("client")
      .populate("artist");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.client._id.toString() !== userId) {
      return res.status(403).json({ message: "You can only approve cancellations for your own bookings." });
    }

    if (booking.status !== "cancellation_requested_by_artist") {
      return res.status(400).json({ message: "No artist cancellation request pending for approval." });
    }

    booking.status = "cancelled";

    // Update payment statuses
    const payments = await Payment.find({ bookingId: booking._id, paymentStatus: "paid" });
    for (const payment of payments) {
      payment.paymentStatus = "refunded"; // or "unpaid" if refund is offline
      await payment.save();
    }

    await booking.save();

    // Notify both parties
    await createNotificationAndEmit({
      userId: booking.client._id,
      userType: "Client",
      type: "booking",
      message: `You approved the artist's cancellation request for booking on ${booking.eventDate.toDateString()}.`,
    });

    await createNotificationAndEmit({
      userId: booking.artist._id,
      userType: "Artist",
      type: "booking",
      message: `Your cancellation request for booking on ${booking.eventDate.toDateString()} was approved by the client.`,
    });

    return res.status(200).json({ message: "Artist cancellation approved and booking cancelled." });
  } catch (err) {
    console.error("Client approval error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
