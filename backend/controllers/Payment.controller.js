import mongoose from "mongoose";
import paypal from "../utils/paypal.js";
import Payment from "../models/Payment.model.js";
import Booking from "../models/Artist.Booking.model.js";
import { createNotificationAndEmit } from "../controllers/Notification.controller.js";

export const createPaypalOrder = async (req, res) => {
  try {
    const { bookingId, paymentType } = req.body;

    const booking = await Booking.findById(bookingId).populate("client artist");

    if (!booking || booking.contractStatus !== "signed") {
      return res.status(400).json({ success: false, message: "Booking not eligible for payment." });
    }

    let totalAmount;

    if (paymentType === "advance") {
      totalAmount = booking.advance || booking.wage;

      if (booking.isPaid) {
        return res.status(400).json({ success: false, message: "Advance already paid." });
      }
    } else if (paymentType === "final") {
      if (!booking.isPaid) {
        return res.status(400).json({ success: false, message: "Advance payment must be done first." });
      }

      const remaining = booking.wage - (booking.advance || 0);
      if (remaining <= 0) {
        return res.status(400).json({ success: false, message: "No remaining balance to pay." });
      }
      totalAmount = remaining;
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment type." });
    }

    const create_payment_json = {
      intent: "sale",
      payer: { payment_method: "paypal" },
      redirect_urls: {
        return_url: `http://localhost:3000/api/payments/paypal/capture?paymentType=${paymentType}`,
        cancel_url: `http://localhost:5173/payment/cancel`,
      },
      transactions: [{
        amount: { currency: "USD", total: totalAmount.toFixed(2) },
        description: `Booking ${paymentType} payment for event at ${booking.location}`,
      }],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
       console.error("PayPal create payment error:", JSON.stringify(error, null, 2));

        return res.status(500).json({ success: false, message: "PayPal payment creation failed." });
      }

      const approvalURL = paymentInfo.links.find(link => link.rel === "approval_url").href;

      // Save bookingId, paymentId, paymentType in cookie for capture step
      res.cookie("paypalBookingInfo", JSON.stringify({
        bookingId: booking._id.toString(),
        paymentId: paymentInfo.id,
        paymentType,
      }), {
        httpOnly: true,
        maxAge: 10 * 60 * 1000, // 10 minutes
        sameSite: "Lax",
      });

      return res.status(200).json({ success: true, approvalURL });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const capturePaypalPayment = async (req, res) => {
  try {
    const { token, PayerID, paymentType: queryPaymentType } = req.query;

    const cookieData = req.cookies.paypalBookingInfo;
    if (!cookieData) return res.status(400).json({ success: false, message: "Missing payment info in cookie" });

    const { bookingId, paymentId, paymentType: cookiePaymentType } = JSON.parse(cookieData);

    // Prefer query param paymentType if present, else from cookie
    const paymentType = queryPaymentType || cookiePaymentType;

    const booking = await Booking.findById(bookingId).populate("client", "username").populate("artist", "username");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    paypal.payment.execute(paymentId, { payer_id: PayerID }, async (error, paymentDetails) => {
      if (error) {
        console.error(error.response);
        return res.status(500).json({ success: false, message: "Payment execution failed." });
      }

      // Determine amount paid based on paymentType
      let amountPaid;
      if (paymentType === "advance") {
        amountPaid = booking.advance || booking.wage;
      } else if (paymentType === "final") {
        amountPaid = booking.wage - (booking.advance || 0);
      } else {
        return res.status(400).json({ success: false, message: "Invalid payment type in capture." });
      }

      // Create payment record
      const paymentRecord = new Payment({
        bookingId: booking._id,
        clientId: booking.client,
        artistId: booking.artist,
        amount: amountPaid,
        currency: "USD",
        paymentMethod: "PayPal",
        paymentStatus: "paid",
        transactionId: paymentDetails.id,
        paidAt: new Date(),
        payerEmail: paymentDetails.payer.payer_info.email,
        paypalDetails: paymentDetails,
        note: paymentType === "advance" ? "Advance payment" : "Final payment",
        paymentType,
      });

      await paymentRecord.save();

      if (!booking.payments.includes(paymentRecord._id)) {
        booking.payments.push(paymentRecord._id);
      }

      // Update booking with atomic transaction protection
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          // Reload booking within transaction to ensure we have latest state
          const latestBooking = await Booking.findById(booking._id).session(session);
          
          if (paymentType === "advance") {
            latestBooking.isPaid = true; 
            latestBooking.status = "booked"; 
          } else if (paymentType === "final") {
            latestBooking.isFinalPaid = true;
            latestBooking.status = "completed";
          }

          latestBooking.lastActionTime = new Date();
          
          if (!latestBooking.payments.includes(paymentRecord._id)) {
            latestBooking.payments.push(paymentRecord._id);
          }
          
          await latestBooking.save({ session });
        });
        
        await session.endSession();
      } catch (transactionError) {
        await session.endSession();
        throw transactionError;
      }

      const clientId = booking.client._id || booking.client;

      // Notify client
      await createNotificationAndEmit({
        userId: clientId,
        userType: "Client",
        type: "payment",
        message: `You ${paymentType} payment for artist ${booking.artist.username} wa successful.`,
        bookingId: booking._id,
        paymentId: paymentRecord._id,
      });

      // Notify artist
      await createNotificationAndEmit({
        userId: booking.artist,
        userType: "Artist",
        type: "payment",
        message: `You have received a ${paymentType} payment from client ${booking.client.username}.`,
        bookingId: booking._id,
        paymentId: paymentRecord._id,
      });

      res.clearCookie("paypalBookingInfo");

      return res.redirect(
        `http://localhost:5173/payment/success?paymentType=${paymentType}&bookingId=${bookingId}&artistId=${booking.artist}`
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPaymentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate("clientId", "username email")
      .populate("artistId", "username email")
      .populate("bookingId");

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({ success: true, receipt: payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

