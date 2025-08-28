import Admin from './Admin.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Artist from "../models/Artist.model.js";
import User from "../models/user.model.js";
import Booking from "../models/Artist.Booking.model.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const Adminlogin = async (req, res) => {
  const { username, password } = req.body;

  
try {
    const admin =await Admin.findOne({username});
    if(!admin)
    {
        return res.status(401).json({message: "Invalid username or password"});
    }


    const accessToken = jwt.sign(
      { username, role: 'admin' },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
      );

        const refreshToken = jwt.sign(
         { username, role: 'admin' },
         REFRESH_TOKEN_SECRET,
         { expiresIn: '7d' }
        );

    return res.json({ accessToken, refreshToken, username, role: 'admin' });

} catch (error) {
    console.error('Admin login error', error);
    res.status(500).json({message: "Internal server error"});
}
    
    
  
}  
  
export const refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Refresh token required' });

  jwt.verify(token, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const accessToken = jwt.sign(
      { username: user.username, role: user.role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  });
};


export const getAdminDashboardData = async(req,res) => {
  try{
    const artists = await Artist.find();
    const clients = await User.find();

    console.log("artist ", artists.length);
    console.log("Client ", clients.length);
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("client", "username")
      .populate("artist", "username");

    res.status(200).json({
      artistCount: artists.length,
      clientCount: clients.length,
      latestBookings: bookings.map(b => ({
        id: b._id,
        clientName: b.client?.username || "Unknown",
        artistName: b.artist?.username || "Unknown",
        date: b.eventDate?.toISOString().split("T")[0],
        status: b.status
      }))
      // artists,
      // clients 
    });
  }
  catch(error)
  {
    console.error("Dashboard Fetch error : ",error);
    res.status(500).json({message: 'Server Error'});
  }
};


//get artist details 

export const getArtistDetail = async(req,res) => 
{
  try {
    const artist = await Artist.find();
    if(!artist)
    {
      return res.status(404).json({message: "Artist not found"});
    }
    res.json(artist);
  } catch (error) {
    console.error("Error fetching artists: ", error);
    res.status(500).json({message: 'Failed to fetch artist details'});
  }
}

//get Client details 

export const getClientDetail = async(req,res) => 
{
  try {
    const client = await User.find();
    if(!client)
    {
      return res.status(404).json({message: "Client not found"});
    }
    res.json(client);
  } catch (error) {
    console.error("Error fetching clients: ", error);
    res.status(500).json({message: 'Failed to fetch client details'});
  }
}

//get all booking
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("client") // Fetch full client object
      .populate("artist"); // Fetch full artist object

    const formatted = bookings.map((b) => ({
      id: b._id,
      clientName: b.client?.username || "Unknown",
      artistName: b.artist?.username || "Unknown",

      date: b.eventDate ? b.eventDate.toISOString() : null,

      status: b.status,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

//get all contract details

export const getAllSignedContracts = async (req, res) => {
  try {
    const signedContracts = await Booking.find({ 
       clientSignatureDate: { $ne: null },
  artistSignatureDate: { $ne: null },
     })
      .populate("client", "username name")
      .populate("artist", "username name");

    const formatted = signedContracts.map(booking => ({
      id: booking._id,
      clientUsername: booking.client?.username || booking.client?.name || "Unknown",
      artistUsername: booking.artist?.username || booking.artist?.name || "Unknown",
      eventDate: booking.eventDate,
      clientSignedAt: booking.clientSignatureDate,
      artistSignedAt: booking.artistSignatureDate,
      wage: booking.wage,
      contractUrl: booking.contractUrl,
    }));
   console.log("Signed bookings found:", formatted.length); // 👈 for debugging
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching signed contracts:", error);
    res.status(500).json({ message: "Failed to fetch signed contracts" });
  }
};


//get unverifed artists
export const getUnverifiedArtists = async (req, res) => {
  try {
    const unverified = await Artist.find({ isVerified: false })
      .sort({ createdAt: -1 })
      .select("username email citizenshipNumber citizenshipImage.url livePhoto.url profilePicture.url");

    res.json(unverified);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unverified artists", error: err.message });
  }
};


//get verified artists
export const verifyArtistById = async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await Artist.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.json({ message: "Artist verified successfully", artist });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};


//get recent verified artists

export const getRecentVerifiedArtists = async (req, res) => {
  try {
    const recentVerified = await Artist.find({ isVerified: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("username email citizenshipNumber citizenshipImage.url livePhoto.url profilePicture.url")
// include needed fields

    res.json(recentVerified);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch verified artists", error: err.message });
  }
};

