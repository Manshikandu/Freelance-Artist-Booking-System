import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Artist from "../models/Artist.model.js";

export const verifytoken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decoded.userId;
    let user = await User.findById(userId).select("-password");
    if (!user) user = await Artist.findById(userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Unauthorized" });
  }
};