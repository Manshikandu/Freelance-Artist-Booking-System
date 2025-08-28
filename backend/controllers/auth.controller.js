import jwt from "jsonwebtoken";

import redis from "../lib/redis.js";
import User from "../models/user.model.js";
import Artist from "../models/Artist.model.js";
import bcrypt from 'bcrypt';
import sendResetEmail from "../utils/sendResetEmail.js";
import { getCoordinatesFromCity } from "../utils/geolocation.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2d" });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clientSignup = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ message: "User already exists" });
      const user = new User({
      username,
      email,
      password, 
      phone,
      role: "client",
    });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);
    res.status(201).json({
      user: {
        _id: user._id,
        username,
        email,
        phone,
        role: user.role,
      },
      message: "Client signed up successfully",
    });
  } catch (error) {
    console.error("Error in clientSignup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const artistSignup = async (req, res) => {
   console.log("Files:", req.files);
    console.log("Body:", req.body);
    
  try {
    const {
      username,
      email,
      phone,
      password,
      city,
      category,
      citizenshipNumber,
      dateOfBirth,
      lat,
      lon
    } = req.body;

    if (!username || !email || !phone || !password || !city || !category || !citizenshipNumber || !dateOfBirth) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const existingArtist = await Artist.findOne({ $or: [{ email }, { phone }] });
    if (existingArtist) {
      return res.status(400).json({ message: "Artist with this email or phone already exists" });
    }

    const age = getAgeFromDOB(dateOfBirth);
    const isUnderage = age < 18;
    
    const citizenshipImageUrl = req.files?.citizenshipImage?.[0]?.path;
    if (!citizenshipImageUrl) {
      return res.status(400).json({ message: "Citizenship image is required" });
    }
    
    const livePhotoUrl = req.files?.livePhoto?.[0]?.path;
    if (!livePhotoUrl) {
      return res.status(400).json({ message: "Live photo is required" });
    }
    
    let guardianData = {};
    if (isUnderage) {
      if (
        !req.body["guardianInfo[name]"] ||
        !req.body["guardianInfo[relation]"] ||
        !req.files?.["guardianInfo[idDocument]"]
      ) {
        return res.status(400).json({
          message: "Guardian information is required for underage artists.",
        });
      }

      guardianData = {
        name: req.body["guardianInfo[name]"],
        relation: req.body["guardianInfo[relation]"],
        idDocument: {
          url: req.files["guardianInfo[idDocument]"][0]?.path,
        },
      };
    }
    
   
    const newArtist = new Artist({
      username,
      email,
      phone,
      password,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lon), parseFloat(lat)],
        city,
      },
      category,
      citizenshipNumber,
      dateOfBirth,
      citizenshipImage: { url: citizenshipImageUrl },
      livePhoto: { url: livePhotoUrl },
      isVerified: false,
      ...(isUnderage && { guardianInfo: guardianData }),
    });

    await newArtist.save();

    res.status(201).json({
  user: {
    _id: newArtist._id,
    username: newArtist.username,
    email: newArtist.email,
    phone: newArtist.phone,
    role: newArtist.role,
    category: newArtist.category,
    location: newArtist.location,
  },
  message: "Artist signed up successfully",
});

    res.status(201).json({
      user: {
        _id: newArtist._id.toString(),
        username: newArtist.username,
        email: newArtist.email,
        phone: newArtist.phone,
        role: newArtist.role,
        category: newArtist.category,
        location: newArtist.location,
      },
      message: "Artist signed up successfully",
    });
  } catch (err) {
   console.error("Artist signup error:", err); 
    res.status(500).json({
      message: "Signup failed",
      error: err.message,
    });
  }
};
function getAgeFromDOB(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    console.log("Login attempt for email:", email);

    let user = await User.findOne({ email });
    let fromModel = "User";

    if (!user) {
      user = await Artist.findOne({ email });
      fromModel = "Artist";
    }

    if (!user)
      return res.status(401).json({ message: "Invalid credentials (email)" });
    const isMatch = await bcrypt.compare(password, user.password);
   
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials (password)" });

    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    const { password: _, ...userData } = user.toObject();

    res.status(200).json({ user: userData });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// LOGOUT
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 *24 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
        const user = await User.findOne({ email }) || await Artist.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    user.resetToken = token;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendResetEmail(email, resetUrl);

    res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user =
      (await User.findById(decoded.userId)) ||
      (await Artist.findById(decoded.userId));

    if (!user || user.resetToken !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = newPassword;
    user.resetToken = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//sendotp

import nodemailer from "nodemailer";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(`otp:${email}`, otp, "EX", 300); // 5 mins

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

//verifyotp

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const storedOtp = await redis.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await redis.del(`otp:${email}`);

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};



