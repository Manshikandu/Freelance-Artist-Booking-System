// middlewares/authenticateArtist.js
import jwt from "jsonwebtoken";
import Artist from "../models/Artist.model.js";
import User from "../models/user.model.js";
export const authenticateArtist = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const artist = await Artist.findById(decoded.userId).select("-password");
    if (!artist) {
      return res.status(403).json({ message: "Forbidden - Artist access only" });
    }

    req.user = artist;
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError"
        ? "Unauthorized - Token expired"
        : "Unauthorized - Invalid token";
    return res.status(401).json({ message });
  }
};
