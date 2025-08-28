import express from "express";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import ConnectMongoDb from "./db/ConnectMongoDb.js";

import artistRoutes from "./routes/Artist.route.js"

import authRoutes from "./routes/auth.route.js";
 import bookingRoutes from "./routes/Artist.Booking.route.js";
import JobPostRoutes from "./routes/Job.Post.route.js";

 import mediaRoutes from "./routes/media.js";
 import artistListRoutes from "./routes/Artist.List.route.js"
 import artistBookingRoutes from "./routes/artistSide/Booking.route.js";
 import AdminRoutes from "./Admin_Backend/Admin.route.js"
 import ClientprofileRoutes from "./routes/Clientprofile.route.js"
 
 
 import ConversationRoutes from "./ChatApp/route/Conversation.route.js";
import ChatAppRoutes from "./ChatApp/route/Chat.route.js";
import UserChatProfile from "./ChatApp/route/UserChatProfile.route.js"
import { app, server } from "./ChatApp/lib/socket.js";
import path from "path";
import { fileURLToPath } from "url";
import matchRoutes from "./routes/artistSide/ArtistMatch.route.js";
import contractRoutes from './routes/Contract.route.js';
import geocodeRoute from "./routes/Geocode.js";
import verifyRoutes from "./routes/admin/verify.route.js";
import notificationRoutes from "./routes/Notification.route.js";
import paymentRoutes from "./routes/Payment.route.js";
import reviewRoutes from "./routes/Review.route.js";
import recommendationRoutes from './routes/clientSide/Artist.Recom.route.js';
import distanceRoutes from "./routes/distance.route.js";


dotenv.config();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.get('/test', (req, res) => {
  res.json({ message: "Test route working" });
});
app.use("/api/artist", artistRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/jobposts", JobPostRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/client/artists", artistListRoutes);
app.use("/api/artist/bookings", artistBookingRoutes);
app.use('/contracts', express.static('contracts'));

app.use("/api", matchRoutes);


app.use('/api/contracts', contractRoutes);
app.use('/contracts', express.static(path.join(process.cwd(), 'contracts')));
app.use("/api/geocode", geocodeRoute);
app.use("/api/auth", AdminRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/clientprofile", ClientprofileRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

app.use('/api/recommend', recommendationRoutes);
app.use("/api/dis", distanceRoutes);
app.use('/api/conversation', ConversationRoutes);
app.use('/api/chat', ChatAppRoutes);
app.use('/api/users/', UserChatProfile);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if(process.env.NODE_ENV==="production")
{
    app.use(express.static(path.join(__dirname,"/frontend/dist")))
    app.get(/.*/, (req,res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    })
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  ConnectMongoDb();
});


